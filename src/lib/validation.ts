/**
 * Comprehensive input validation and sanitization utilities
 * Provides security-focused validation for all user inputs
 */

import Joi from 'joi';

// Custom sanitization functions
export class Sanitizer {
  /**
   * Sanitize text input by removing potentially dangerous characters
   */
  static sanitizeText(input: string, maxLength: number = 1000): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .trim()
      // Remove null bytes and other control characters
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      // Remove potential script injection patterns
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      // Limit length
      .substring(0, maxLength);
  }

  /**
   * Sanitize email addresses
   */
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') return '';

    return email
      .trim()
      .toLowerCase()
      // Remove any whitespace
      .replace(/\s+/g, '')
      // Basic email sanitization
      .replace(/[<>'"&]/g, '');
  }

  /**
   * Sanitize names (allow only letters, spaces, hyphens, apostrophes)
   */
  static sanitizeName(name: string): string {
    if (!name || typeof name !== 'string') return '';

    return name
      .trim()
      // Allow only letters, spaces, hyphens, apostrophes
      .replace(/[^a-zA-Z\s\-']/g, '')
      // Normalize spaces
      .replace(/\s+/g, ' ')
      .substring(0, 100);
  }

  /**
   * Sanitize file names for uploads
   */
  static sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') return '';

    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 255);
  }

  /**
   * Sanitize URLs
   */
  static sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') return '';

    try {
      const parsedUrl = new URL(url);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return '';
      }
      return parsedUrl.toString();
    } catch {
      return '';
    }
  }

  /**
   * Sanitize SQL-like inputs (defensive programming)
   */
  static sanitizeSqlInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .replace(/['";\\]/g, '')
      .substring(0, 1000);
  }
}

// Validation schemas using Joi
export class ValidationSchemas {
  // User authentication schemas
  static readonly signupSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .max(254)
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.max': 'Email address is too long',
        'any.required': 'Email is required'
      }),

    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),

    name: Joi.string()
      .min(1)
      .max(100)
      .pattern(/^[a-zA-Z\s\-']+$/)
      .required()
      .messages({
        'string.min': 'Name cannot be empty',
        'string.max': 'Name is too long',
        'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
        'any.required': 'Name is required'
      }),

    childProfile: Joi.object({
      name: Joi.string()
        .min(1)
        .max(100)
        .pattern(/^[a-zA-Z\s\-']+$/)
        .required(),

      birthdate: Joi.date()
        .max('now')
        .min(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000)) // Max 18 years old
        .required(),

      gender: Joi.string()
        .valid('male', 'female', 'other', 'unspecified')
        .required(),

      interests: Joi.array()
        .items(Joi.string().max(50))
        .max(20)
        .optional()
    }).required(),

    selectedTemplate: Joi.string()
      .valid('pastel-dreams', 'adventure-boy', 'rainbow-fantasy')
      .required(),

    csrfToken: Joi.string()
      .length(64)
      .hex()
      .optional()
  });

  static readonly childLoginSchema = Joi.object({
    familyUuid: Joi.string()
      .uuid({ version: 'uuidv4' })
      .required()
      .messages({
        'string.uuid': 'Invalid family code format',
        'any.required': 'Family code is required'
      }),

    password: Joi.string()
      .min(1)
      .max(128)
      .required()
      .messages({
        'string.min': 'Password cannot be empty',
        'string.max': 'Password is too long',
        'any.required': 'Password is required'
      })
  });

  static readonly profileUpdateSchema = Joi.object({
    parent: Joi.object({
      name: Joi.string()
        .min(1)
        .max(100)
        .pattern(/^[a-zA-Z\s\-']+$/)
        .optional()
    }).optional(),

    child: Joi.object({
      name: Joi.string()
        .min(1)
        .max(100)
        .pattern(/^[a-zA-Z\s\-']+$/)
        .optional(),

      birthdate: Joi.date()
        .max('now')
        .min(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000))
        .optional(),

      gender: Joi.string()
        .valid('male', 'female', 'other', 'unspecified')
        .optional(),

      interests: Joi.array()
        .items(Joi.string().max(50))
        .max(20)
        .optional(),

      selectedTemplate: Joi.string()
        .valid('pastel-dreams', 'adventure-boy', 'rainbow-fantasy')
        .optional()
    }).optional(),

    csrfToken: Joi.string()
      .length(64)
      .hex()
      .required()
      .messages({
        'any.required': 'Security token is required'
      })
  });

  // Tile content validation
  static readonly tileUpdateSchema = Joi.object({
    title: Joi.string()
      .max(200)
      .allow('')
      .optional(),

    body: Joi.string()
      .max(2000)
      .allow('')
      .optional(),

    gift: Joi.object({
      type: Joi.string()
        .valid('sticker', 'video', 'downloadable', 'link', 'experience')
        .required(),

      content: Joi.string()
        .max(1000)
        .when('type', {
          is: 'link',
          then: Joi.string().uri(),
          otherwise: Joi.optional()
        }),

      instructions: Joi.string()
        .max(500)
        .optional()
    }).optional()
  });

  // File upload validation
  static readonly fileUploadSchema = Joi.object({
    filename: Joi.string()
      .max(255)
      .pattern(/^[^<>:;,?"*|\\]+$/),

    contentType: Joi.string()
      .valid('image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime')
      .required(),

    size: Joi.number()
      .max(10 * 1024 * 1024) // 10MB max
      .required()
  });
}

// Validation utility functions
export class ValidationUtils {
  /**
   * Validate input against a schema
   */
  static async validateInput<T>(
    data: unknown,
    schema: Joi.ObjectSchema<T>
  ): Promise<{ success: true; value: T } | { success: false; errors: string[] }> {
    try {
      const validatedValue = await schema.validateAsync(data, {
        abortEarly: false,
        stripUnknown: true
      });

      return { success: true, value: validatedValue };
    } catch (error: any) {
      const errors = error.details?.map((detail: any) => detail.message) || ['Validation failed'];
      return { success: false, errors };
    }
  }

  /**
   * Sanitize and validate combined operation
   */
  static sanitizeAndValidate<T>(
    data: unknown,
    schema: Joi.ObjectSchema<T>
  ): Promise<{ success: true; value: T } | { success: false; errors: string[] }> {
    // Pre-sanitize common fields
    const inputData = data as Record<string, any>;
    const sanitizedData = { ...inputData };

    if (sanitizedData.email) {
      sanitizedData.email = Sanitizer.sanitizeEmail(sanitizedData.email);
    }

    if (sanitizedData.name) {
      sanitizedData.name = Sanitizer.sanitizeName(sanitizedData.name);
    }

    if (sanitizedData.title) {
      sanitizedData.title = Sanitizer.sanitizeText(sanitizedData.title, 200);
    }

    if (sanitizedData.body) {
      sanitizedData.body = Sanitizer.sanitizeText(sanitizedData.body, 2000);
    }

    // Recursively sanitize child profile
    if (sanitizedData.childProfile?.name) {
      sanitizedData.childProfile.name = Sanitizer.sanitizeName(sanitizedData.childProfile.name);
    }

    if (sanitizedData.child?.name) {
      sanitizedData.child.name = Sanitizer.sanitizeName(sanitizedData.child.name);
    }

    if (sanitizedData.parent?.name) {
      sanitizedData.parent.name = Sanitizer.sanitizeName(sanitizedData.parent.name);
    }

    return this.validateInput(sanitizedData, schema);
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(
    file: { name: string; type: string; size: number }
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file name
    if (!file.name || file.name.length > 255) {
      errors.push('Invalid file name');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit');
    }

    // Check for malicious file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar'];
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (dangerousExtensions.includes(fileExt)) {
      errors.push('File type not allowed');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate child age appropriateness
   */
  static validateChildAge(birthdate: Date): { valid: boolean; age: number; errors: string[] } {
    const today = new Date();
    const age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();

    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())
      ? age - 1
      : age;

    const errors: string[] = [];

    if (actualAge < 3) {
      errors.push('Child must be at least 3 years old');
    }

    if (actualAge > 18) {
      errors.push('Child cannot be older than 18 years');
    }

    if (birthdate > today) {
      errors.push('Birthdate cannot be in the future');
    }

    return {
      valid: errors.length === 0,
      age: actualAge,
      errors
    };
  }
}

// Export convenience functions
export const validateSignup = (data: unknown) =>
  ValidationUtils.sanitizeAndValidate(data, ValidationSchemas.signupSchema);

export const validateChildLogin = (data: unknown) =>
  ValidationUtils.sanitizeAndValidate(data, ValidationSchemas.childLoginSchema);

export const validateProfileUpdate = (data: unknown) =>
  ValidationUtils.sanitizeAndValidate(data, ValidationSchemas.profileUpdateSchema);

export const validateTileUpdate = (data: unknown) =>
  ValidationUtils.validateInput(data, ValidationSchemas.tileUpdateSchema);

export const validateFileUpload = ValidationUtils.validateFileUpload;
export const validateChildAge = ValidationUtils.validateChildAge;