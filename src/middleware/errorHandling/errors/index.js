/**
 * Error classes exports
 * Provides easy access to all custom error types
 */
const BaseError = require('./BaseError');
const ValidationError = require('./ValidationError');
const ServiceError = require('./ServiceError');
const ExternalAPIError = require('./ExternalAPIError');

module.exports = {
  BaseError,
  ValidationError,
  ServiceError,
  ExternalAPIError
}; 