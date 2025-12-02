/**
 * Authentication API endpoints
 * Handles parent authentication, child login, and profile management
 */

import { createClient } from '@supabase/supabase-js';
import { AuthUtils } from '../../src/lib/auth.js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
async function getUserFromToken(request) {
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
async function handleParentSignup(request) {
  try {
    const { email, password, name, childProfile } = await request.json();

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

    // Validate child profile
    const { name: childName, birthdate, gender, interests } = childProfile;
    if (!childName || !birthdate || !gender) {
      return new Response(JSON.stringify({
        error: 'Child profile missing required fields: name, birthdate, gender'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const birthdateValidation = AuthUtils.isValidBirthdate(birthdate);
    if (!birthdateValidation.valid) {
      return new Response(JSON.stringify({
        error: birthdateValidation.error
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if email already exists
    const { data: existingUsers } = await supabase
      .from('parents')
      .select('email')
      .eq('email', AuthUtils.sanitizeInput(email))
      .single();

    if (existingUsers) {
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
        interests: interests || {}
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
async function handleChildLogin(request) {
  try {
    const { familyUuid, password } = await request.json();

    if (!familyUuid || !password) {
      return new Response(JSON.stringify({
        error: 'Missing familyUuid or password'
      }), {
        status: 400,
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
      return new Response(JSON.stringify({
        error: 'Invalid family code'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get child profile (assuming single child per parent for now)
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('child_uuid, name, birthdate, gender, interests, selected_template')
      .eq('parent_uuid', parent.parent_uuid)
      .single();

    if (childError || !child) {
      return new Response(JSON.stringify({
        error: 'Child profile not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For now, we'll use a simple password check
    // In production, this should be properly hashed and stored
    // TODO: Implement proper password hashing for child login
    const isValidPassword = password === 'temp123' || password.length >= 6; // Placeholder

    if (!isValidPassword) {
      return new Response(JSON.stringify({
        error: 'Invalid password'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
async function handleGetProfile(request) {
  try {
    const user = await getUserFromToken(request);
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
 * PUT /api/auth/profile - Update user profile
 */
async function handleUpdateProfile(request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updates = await request.json();

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

        if (childError) {
          console.error('Child update error:', childError);
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
  const { request } = context;

  // Handle CORS
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

  const url = new URL(request.url);
  const path = url.pathname.replace('/api/auth', '');

  // Route requests
  if (request.method === 'POST' && path === '/signup') {
    return handleParentSignup(request);
  }

  if (request.method === 'POST' && path === '/child-login') {
    return handleChildLogin(request);
  }

  if (request.method === 'GET' && path === '/profile') {
    return handleGetProfile(request);
  }

  if (request.method === 'PUT' && path === '/profile') {
    return handleUpdateProfile(request);
  }

  return new Response(JSON.stringify({
    error: 'Endpoint not found'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}