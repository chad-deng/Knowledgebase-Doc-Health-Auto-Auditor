const BaseError = require('./BaseError');

/**
 * Validation Error class for input validation failures
 * Provides field-specific error context
 */
class ValidationError extends BaseError {
  constructor(message, field = null, value = null, constraints = {}) {
    super(message, 400, 'VALIDATION_ERROR', {
      field,
      value: value ? String(value).substring(0, 100) : null, // Truncate for security
      constraints
    });
  }

  /**
   * Create a validation error for a required field
   */
  static required(field) {
    return new ValidationError(
      `The ${field} field is required`,
      field,
      null,
      { required: true }
    );
  }

  /**
   * Create a validation error for field length
   */
  static invalidLength(field, value, minLength = null, maxLength = null) {
    const constraints = {};
    let message = `Invalid length for ${field}`;
    
    if (minLength !== null) {
      constraints.minLength = minLength;
      message += ` (minimum: ${minLength})`;
    }
    
    if (maxLength !== null) {
      constraints.maxLength = maxLength;
      message += ` (maximum: ${maxLength})`;
    }

    return new ValidationError(message, field, value, constraints);
  }

  /**
   * Create a validation error for invalid format
   */
  static invalidFormat(field, value, pattern = null) {
    const constraints = pattern ? { pattern } : {};
    return new ValidationError(
      `Invalid format for ${field}`,
      field,
      value,
      constraints
    );
  }

  /**
   * Create a validation error for invalid enum value
   */
  static invalidEnum(field, value, allowedValues = []) {
    return new ValidationError(
      `Invalid value for ${field}. Allowed values: ${allowedValues.join(', ')}`,
      field,
      value,
      { enum: allowedValues }
    );
  }
}

module.exports = ValidationError; 