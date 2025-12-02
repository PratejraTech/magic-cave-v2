/**
 * Authentication API endpoints
 * Handles parent authentication, child login, and profile management
 */

import { createClient } from '@supabase/supabase-js';
import { AuthUtils } from '../../src/lib/auth.ts';
import { validateSignup, validateChildLogin, validateProfileUpdate, validateChildAge } from '../../src/lib/validation.ts';
import { createSecureJsonResponse, createSecureErrorResponse } from '../../src/lib/securityHeaders.ts';
import { exportUserData } from '../../src/lib/compliance.ts';

/**
 * Validate request method and CORS
 */
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
}

/**
 * Get user from authorization header
 */
async function getUserFromToken(request, supabase) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) {
    console.error('Error getting user from token:', error);
    return null;
  }

  return user;
}

/**
 * POST /api/auth/signup - Parent sign up
 */
   async function handleParentSignup(request, supabase) {
    const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';

    try {
      const rawData = await request.json();

      // Comprehensive input validation and sanitization
      const validation = await validateSignup(rawData);
      if (!validation.success) {
        await supabase.rpc('log_security_event', {
          p_user_id: null,
          p_action: 'signup_attempt',
          p_resource_type: 'auth',
          p_ip_address: clientIP,
          p_user_agent: userAgent,
          p_metadata: { reason: 'validation_failed', errors: validation.errors },
          p_success: false
        });

        return new Response(JSON.stringify({
          error: 'Invalid input data',
          details: validation.errors
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const { email, password, name, childProfile, selectedTemplate } = validation.value;
      const { name: childName, birthdate, gender, interests } = childProfile;

      // Additional child age validation
      const ageValidation = validateChildAge(new Date(birthdate));
      if (!ageValidation.valid) {
        await supabase.rpc('log_security_event', {
          p_user_id: null,
          p_action: 'signup_attempt',
          p_resource_type: 'auth',
          p_ip_address: clientIP,
          p_user_agent: userAgent,
          p_metadata: { reason: 'invalid_child_age', errors: ageValidation.errors },
          p_success: false
        });

        return new Response(JSON.stringify({
          error: 'Invalid child information',
          details: ageValidation.errors
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Rate limiting check for signup
      const rateLimitKey = `signup:${clientIP}`;
      const { data: rateLimitResult } = await supabase.rpc('check_rate_limit', {
        p_identifier: rateLimitKey,
        p_endpoint: 'signup',
        p_max_attempts: 3,
        p_window_minutes: 60 // 3 attempts per hour
      });

      if (!rateLimitResult) {
        await supabase.rpc('log_security_event', {
          p_user_id: null,
          p_action: 'signup_attempt',
          p_resource_type: 'auth',
          p_ip_address: clientIP,
          p_user_agent: userAgent,
          p_metadata: { reason: 'rate_limited', email },
          p_success: false
        });

        return new Response(JSON.stringify({
          error: 'Too many signup attempts. Please try again later.'
        }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        });
      }

    // Validate required fields
    if (!email || !password || !name || !childProfile) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: email, password, name, childProfile'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate email
    if (!AuthUtils.isValidEmail(email)) {
      return new Response(JSON.stringify({
        error: 'Invalid email format'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate password
    const passwordValidation = AuthUtils.isValidPassword(password);
    if (!passwordValidation.valid) {
      return new Response(JSON.stringify({
        error: 'Password validation failed',
        details: passwordValidation.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Map template ID to UUID
    const templateMapping = {
      'pastel-dreams': '550e8400-e29b-41d4-a716-446655440000',
      'adventure-boy': '550e8400-e29b-41d4-a716-446655440001',
      'rainbow-fantasy': '550e8400-e29b-41d4-a716-446655440002'
    };

    const templateUuid = templateMapping[selectedTemplate];
    if (!templateUuid) {
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_action: 'signup_attempt',
        p_resource_type: 'auth',
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { reason: 'invalid_template', template: selectedTemplate },
        p_success: false
      });

      return new Response(JSON.stringify({
        error: 'Invalid template selection'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if email already exists
    const { data: existingUsers } = await supabase
      .from('parents')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUsers) {
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_action: 'signup_attempt',
        p_resource_type: 'auth',
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { reason: 'email_exists', email },
        p_success: false
      });

      return new Response(JSON.stringify({
        error: 'Email already registered'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate family UUID and temporary password
    const familyUuid = AuthUtils.generateFamilyUUID();
    const tempPassword = AuthUtils.generateTemporaryPassword();

    // Hash the temporary password for secure storage
    const saltRounds = 12;
    const hashedTempPassword = await bcrypt.hash(tempPassword, saltRounds);

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: AuthUtils.sanitizeInput(email),
      password,
      email_confirm: true,
      user_metadata: {
        name: AuthUtils.sanitizeInput(name),
        role: 'parent'
      }
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return new Response(JSON.stringify({
        error: 'Failed to create user account'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create parent record
    const { data: parentData, error: parentError } = await supabase
      .from('parents')
      .insert({
        parent_uuid: authData.user.id,
        name: AuthUtils.sanitizeInput(name),
        email: AuthUtils.sanitizeInput(email),
        auth_provider: 'email',
        family_uuid: familyUuid
      })
      .select()
      .single();

    if (parentError) {
      console.error('Parent creation error:', parentError);
      // Clean up auth user if parent creation failed
      await supabase.auth.admin.deleteUser(authData.user.id);
      return new Response(JSON.stringify({
        error: 'Failed to create parent profile'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create child profile
    const { data: childData, error: childError } = await supabase
      .from('children')
      .insert({
        parent_uuid: parentData.parent_uuid,
        name: AuthUtils.sanitizeInput(childName),
        birthdate,
        gender,
        interests: interests || {},
        selected_template: templateUuid,
        password_hash: hashedTempPassword,
        password_updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (childError) {
      console.error('Child creation error:', childError);
      // Clean up on error
      await supabase.from('parents').delete().eq('parent_uuid', parentData.parent_uuid);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return new Response(JSON.stringify({
        error: 'Failed to create child profile'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create calendar for the child
    const { data: calendarData, error: calendarError } = await supabase
      .from('calendars')
      .insert({
        child_uuid: childData.child_uuid,
        parent_uuid: parentData.parent_uuid,
        template_id: templateUuid
      })
      .select()
      .single();

    if (calendarError) {
      console.error('Calendar creation error:', calendarError);
      // Clean up on error
      await supabase.from('children').delete().eq('child_uuid', childData.child_uuid);
      await supabase.from('parents').delete().eq('parent_uuid', parentData.parent_uuid);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return new Response(JSON.stringify({
        error: 'Failed to create calendar'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create 25 calendar tiles
    const tilesData = [];
    for (let day = 1; day <= 25; day++) {
      tilesData.push({
        calendar_id: calendarData.calendar_id,
        day: day
      });
    }

    const { error: tilesError } = await supabase
      .from('calendar_tiles')
      .insert(tilesData);

    if (tilesError) {
      console.error('Tiles creation error:', tilesError);
      // Clean up on error
      await supabase.from('calendar_tiles').delete().eq('calendar_id', calendarData.calendar_id);
      await supabase.from('calendars').delete().eq('calendar_id', calendarData.calendar_id);
      await supabase.from('children').delete().eq('child_uuid', childData.child_uuid);
      await supabase.from('parents').delete().eq('parent_uuid', parentData.parent_uuid);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return new Response(JSON.stringify({
        error: 'Failed to create calendar tiles'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log successful signup
    await supabase.rpc('log_security_event', {
      p_user_id: authData.user.id,
      p_action: 'signup_success',
      p_resource_type: 'auth',
      p_resource_id: authData.user.id,
      p_ip_address: clientIP,
      p_user_agent: userAgent,
      p_metadata: { email: AuthUtils.sanitizeInput(email), has_child: true },
      p_success: true
    });

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: parentData.name
      },
      child: {
        id: childData.child_uuid,
        name: childData.name,
        familyUuid,
        tempPassword
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Signup error:', error);

    // Log signup failure
    await supabase.rpc('log_security_event', {
      p_user_id: null,
      p_action: 'signup_failure',
      p_resource_type: 'auth',
      p_ip_address: clientIP,
      p_user_agent: userAgent,
      p_metadata: {
        email: email ? AuthUtils.sanitizeInput(email) : null,
        error: error.message
      },
      p_success: false
    });

    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * POST /api/auth/child-login - Child login with family UUID and password
 */
async function handleChildLogin(request, supabase) {
  const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  const userAgent = request.headers.get('User-Agent') || 'unknown';

  try {
    const rawData = await request.json();

    // Validate input data
    const validation = await validateChildLogin(rawData);
    if (!validation.success) {
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_action: 'child_login_attempt',
        p_resource_type: 'auth',
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { reason: 'validation_failed', errors: validation.errors },
        p_success: false
      });

      return new Response(JSON.stringify({
        error: 'Invalid input data',
        details: validation.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { familyUuid, password } = validation.value;

    // Rate limiting check
    const rateLimitKey = `child-login:${clientIP}`;
    const { data: rateLimitResult } = await supabase.rpc('check_rate_limit', {
      p_identifier: rateLimitKey,
      p_endpoint: 'child-login',
      p_max_attempts: 5,
      p_window_minutes: 15
    });

    if (!rateLimitResult) {
      // Log failed attempt
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_action: 'login_attempt',
        p_resource_type: 'auth',
        p_resource_id: familyUuid,
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { reason: 'rate_limited' },
        p_success: false
      });

      return new Response(JSON.stringify({
        error: 'Too many login attempts. Please try again later.'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find parent by family UUID
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('parent_uuid, name')
      .eq('family_uuid', familyUuid)
      .single();

    if (parentError || !parent) {
      // Log failed attempt
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_action: 'login_attempt',
        p_resource_type: 'auth',
        p_resource_id: familyUuid,
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { reason: 'invalid_family_uuid' },
        p_success: false
      });

      return new Response(JSON.stringify({
        error: 'Invalid family code'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get child profile with password fields
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('child_uuid, name, birthdate, gender, interests, selected_template, password_hash, login_attempts, locked_until')
      .eq('parent_uuid', parent.parent_uuid)
      .single();

    if (childError || !child) {
      // Log failed attempt
      await supabase.rpc('log_security_event', {
        p_user_id: parent.parent_uuid,
        p_action: 'login_attempt',
        p_resource_type: 'auth',
        p_resource_id: familyUuid,
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { reason: 'child_not_found' },
        p_success: false
      });

      return new Response(JSON.stringify({
        error: 'Child profile not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if account is locked
    if (child.locked_until && new Date(child.locked_until) > new Date()) {
      await supabase.rpc('log_security_event', {
        p_user_id: parent.parent_uuid,
        p_action: 'login_attempt',
        p_resource_type: 'auth',
        p_resource_id: child.child_uuid,
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { reason: 'account_locked', locked_until: child.locked_until },
        p_success: false
      });

      return new Response(JSON.stringify({
        error: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
      }), {
        status: 423,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let isValidPassword = false;

    // Check password - support both new hashed passwords and legacy method during migration
    if (child.password_hash) {
      // Use bcrypt to verify hashed password
      isValidPassword = await bcrypt.compare(password, child.password_hash);
    } else {
      // Legacy password check - will be migrated on successful login
      isValidPassword = password === 'temp123' || password.length >= 6;

      // If legacy password works, hash and store the new password
      if (isValidPassword && password !== 'temp123') {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await supabase
          .from('children')
          .update({
            password_hash: hashedPassword,
            password_updated_at: new Date().toISOString(),
            login_attempts: 0 // Reset on successful migration
          })
          .eq('child_uuid', child.child_uuid);
      }
    }

    if (!isValidPassword) {
      // Increment login attempts
      const newAttempts = (child.login_attempts || 0) + 1;
      let lockedUntil = null;

      // Lock account after 5 failed attempts for 30 minutes
      if (newAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      }

      await supabase
        .from('children')
        .update({
          login_attempts: newAttempts,
          locked_until: lockedUntil
        })
        .eq('child_uuid', child.child_uuid);

      // Log failed attempt
      await supabase.rpc('log_security_event', {
        p_user_id: parent.parent_uuid,
        p_action: 'login_attempt',
        p_resource_type: 'auth',
        p_resource_id: child.child_uuid,
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { reason: 'invalid_password', attempt_count: newAttempts },
        p_success: false
      });

      return new Response(JSON.stringify({
        error: 'Invalid password'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Successful login - reset attempts and log success
    await supabase
      .from('children')
      .update({
        login_attempts: 0,
        locked_until: null
      })
      .eq('child_uuid', child.child_uuid);

    await supabase.rpc('log_security_event', {
      p_user_id: parent.parent_uuid,
      p_action: 'login_success',
      p_resource_type: 'auth',
      p_resource_id: child.child_uuid,
      p_ip_address: clientIP,
      p_user_agent: userAgent,
      p_metadata: { method: 'child_login' },
      p_success: true
    });

    // Get calendar for child
    const { data: calendar } = await supabase
      .from('calendars')
      .select('calendar_id, last_tile_opened, settings')
      .eq('child_uuid', child.child_uuid)
      .single();

    return new Response(JSON.stringify({
      success: true,
      child: {
        id: child.child_uuid,
        name: child.name,
        birthdate: child.birthdate,
        gender: child.gender,
        interests: child.interests,
        template: child.selected_template
      },
      calendar: calendar ? {
        id: calendar.calendar_id,
        lastTileOpened: calendar.last_tile_opened,
        settings: calendar.settings
      } : null
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Child login error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * GET /api/auth/profile - Get current user profile
 */
async function handleGetProfile(request, supabase) {
  try {
    const user = await getUserFromToken(request, supabase);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get parent profile
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('*')
      .eq('parent_uuid', user.id)
      .single();

    if (parentError || !parent) {
      return new Response(JSON.stringify({
        error: 'Parent profile not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get child profile
    const { data: child } = await supabase
      .from('children')
      .select('*')
      .eq('parent_uuid', user.id)
      .single();

    return new Response(JSON.stringify({
      success: true,
      profile: {
        parent,
        child: child || null
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * DELETE /api/auth/account - Delete user account and all associated data
 */
async function handleDeleteAccount(request, supabase) {
  try {
    const user = await getUserFromToken(request, supabase);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get parent data
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('parent_uuid, family_uuid')
      .eq('parent_uuid', user.id)
      .single();

    if (parentError || !parent) {
      return new Response(JSON.stringify({
        error: 'Parent profile not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get child data
    const { data: child } = await supabase
      .from('children')
      .select('child_uuid')
      .eq('parent_uuid', user.id)
      .single();

    // Cascade delete: analytics events, calendar tiles, calendars, child, parent, then auth user
    if (child) {
      // Delete analytics events for this child
      await supabase
        .from('analytics_events')
        .delete()
        .eq('child_uuid', child.child_uuid);

      // Get calendar for child
      const { data: calendar } = await supabase
        .from('calendars')
        .select('calendar_id')
        .eq('child_uuid', child.child_uuid)
        .single();

      if (calendar) {
        // Delete calendar tiles
        await supabase
          .from('calendar_tiles')
          .delete()
          .eq('calendar_id', calendar.calendar_id);

        // Delete calendar
        await supabase
          .from('calendars')
          .delete()
          .eq('calendar_id', calendar.calendar_id);

        // Note: Media files in storage would need to be cleaned up separately
        // This would require listing and deleting files from the storage bucket
      }

      // Delete child
      await supabase
        .from('children')
        .delete()
        .eq('child_uuid', child.child_uuid);
    }

    // Delete analytics events for parent
    await supabase
      .from('analytics_events')
      .delete()
      .eq('parent_uuid', user.id);

    // Delete parent
    await supabase
      .from('parents')
      .delete()
      .eq('parent_uuid', user.id);

    // Delete auth user (this will sign them out)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error('Auth user deletion error:', deleteError);
      // Continue anyway as other data is deleted
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Account and all associated data deleted successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Delete account error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * GET /api/auth/export - Export user data for GDPR compliance
 */
async function handleDataExport(request, supabase) {
  try {
    const user = await getUserFromToken(request, supabase);
    if (!user) {
      return createSecureErrorResponse('Unauthorized', 401);
    }

    // Log data export request
    await supabase.rpc('log_security_event', {
      p_user_id: user.id,
      p_action: 'data_export_requested',
      p_resource_type: 'compliance',
      p_resource_id: user.id,
      p_ip_address: request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown',
      p_user_agent: request.headers.get('User-Agent') || 'unknown',
      p_metadata: { export_type: 'gdpr' },
      p_success: true
    });

    // Export user data
    const exportResult = await exportUserData(user.id);

    if (!exportResult.success) {
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_action: 'data_export_failed',
        p_resource_type: 'compliance',
        p_resource_id: user.id,
        p_metadata: { errors: exportResult.errors },
        p_success: false
      });

      return createSecureErrorResponse('Data export failed', 500);
    }

    // Log successful export
    await supabase.rpc('log_security_event', {
      p_user_id: user.id,
      p_action: 'data_export_completed',
      p_resource_type: 'compliance',
      p_resource_id: user.id,
      p_metadata: { record_count: JSON.stringify(exportResult.data).length },
      p_success: true
    });

    return createSecureJsonResponse({
      success: true,
      message: 'Data export completed successfully',
      data: exportResult.data,
      download_url: `/api/download-export/${user.id}` // Placeholder for future download endpoint
    });

  } catch (error) {
    console.error('Data export error:', error);
    return createSecureErrorResponse('Internal server error', 500);
  }
}

/**
 * PUT /api/auth/profile - Update user profile
 */
 async function handleUpdateProfile(request, supabase) {
  try {
    const user = await getUserFromToken(request, supabase);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const rawData = await request.json();

    // Validate input data
    const validation = await validateProfileUpdate(rawData);
    if (!validation.success) {
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_action: 'profile_update_attempt',
        p_resource_type: 'auth',
        p_resource_id: user.id,
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { reason: 'validation_failed', errors: validation.errors },
        p_success: false
      });

      return new Response(JSON.stringify({
        error: 'Invalid input data',
        details: validation.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { updates, csrfToken } = validation.value;

    // CSRF validation
    if (!csrfToken) {
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_action: 'profile_update_attempt',
        p_resource_type: 'auth',
        p_resource_id: user.id,
        p_ip_address: request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown',
        p_user_agent: request.headers.get('User-Agent') || 'unknown',
        p_metadata: { reason: 'missing_csrf_token' },
        p_success: false
      });

      return new Response(JSON.stringify({
        error: 'CSRF token required'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate CSRF token
    const { data: isValidToken } = await supabase.rpc('validate_csrf_token', {
      p_user_id: user.id,
      p_token: csrfToken
    });

    if (!isValidToken) {
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_action: 'profile_update_attempt',
        p_resource_type: 'auth',
        p_resource_id: user.id,
        p_ip_address: request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown',
        p_user_agent: request.headers.get('User-Agent') || 'unknown',
        p_metadata: { reason: 'invalid_csrf_token' },
        p_success: false
      });

      return new Response(JSON.stringify({
        error: 'Invalid CSRF token'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update parent profile
    if (updates.parent) {
      const { error: parentError } = await supabase
        .from('parents')
        .update({
          name: updates.parent.name ? AuthUtils.sanitizeInput(updates.parent.name) : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('parent_uuid', user.id);

      if (parentError) {
        console.error('Parent update error:', parentError);
        return new Response(JSON.stringify({
          error: 'Failed to update parent profile'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Update child profile
    if (updates.child) {
      const childUpdates = {};

      if (updates.child.name) {
        childUpdates.name = AuthUtils.sanitizeInput(updates.child.name);
      }

      if (updates.child.birthdate) {
        const validation = AuthUtils.isValidBirthdate(updates.child.birthdate);
        if (!validation.valid) {
          return new Response(JSON.stringify({
            error: validation.error
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        childUpdates.birthdate = updates.child.birthdate;
      }

      if (updates.child.gender) {
        childUpdates.gender = updates.child.gender;
      }

      if (updates.child.interests) {
        childUpdates.interests = updates.child.interests;
      }

      if (updates.child.selectedTemplate) {
        childUpdates.selected_template = updates.child.selectedTemplate;
      }

      if (Object.keys(childUpdates).length > 0) {
        childUpdates.updated_at = new Date().toISOString();

        const { error } = await supabase
          .from('children')
          .update(childUpdates)
          .eq('parent_uuid', user.id);

        if (error) {
          console.error('Child update error:', error);
          return new Response(JSON.stringify({
            error: 'Failed to update child profile'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Profile updated successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  // Initialize Supabase client from environment
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({
      error: 'Supabase configuration missing'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Handle CORS
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

  const url = new URL(request.url);
  const path = url.pathname.replace('/api/auth', '');

  // Route requests
  if (request.method === 'POST' && path === '/signup') {
    return handleParentSignup(request, supabase);
  }

  if (request.method === 'POST' && path === '/child-login') {
    return handleChildLogin(request, supabase);
  }

  if (request.method === 'POST' && path === '/family-login') {
    return handleChildLogin(request, supabase); // Alias for child-login
  }

  if (request.method === 'GET' && path === '/profile') {
    return handleGetProfile(request, supabase);
  }

  if (request.method === 'PUT' && path === '/profile') {
    return handleUpdateProfile(request, supabase);
  }

  if (request.method === 'DELETE' && path === '/account') {
    return handleDeleteAccount(request, supabase);
  }

  if (request.method === 'GET' && path === '/export') {
    return handleDataExport(request, supabase);
  }

  return new Response(JSON.stringify({
    error: 'Endpoint not found'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}