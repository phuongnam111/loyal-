/**
 * Response validator for API responses
 * Supports status validation, JSON parsing, and JSON Schema validation
 */

class ResponseValidator {
  /**
   * Validate response HTTP status
   */
  static validateStatus(response, expectedStatus = 200) {
    const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    if (!expected.includes(response.status)) {
      const err = new Error(
        `Expected status ${expected.join('|')}, got ${response.status} ${response.statusText || ''}`
      );
      err.status = response.status;
      err.response = response;
      throw err;
    }
    return response;
  }

  /**
   * Parse response body as JSON
   */
  static async parseJson(response) {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error(`Invalid JSON response: ${text?.slice(0, 300)}`);
    }
  }

  /**
   * Validate data against a JSON Schema
   * @param {Object} data - data to validate
   * @param {Object} schema - JSON schema object
   * @returns {Object} - { valid, errors, data }
   */
  static validateSchema(data, schema) {
    if (!schema) return { valid: true, errors: [], data };

    const errors = [];

    // Validate required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (data[field] === undefined || data[field] === null) {
          errors.push(`Missing required field: "${field}"`);
        }
      }
    }

    // Validate property types
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (data[key] === undefined) continue;
        const value = data[key];

        if (prop.type === 'string' && typeof value !== 'string') {
          errors.push(`Field "${key}" expected string, got ${typeof value}`);
        }
        if (prop.type === 'number' && typeof value !== 'number') {
          errors.push(`Field "${key}" expected number, got ${typeof value}`);
        }
        if (prop.type === 'integer' && (!Number.isInteger(value))) {
          errors.push(`Field "${key}" expected integer, got ${value}`);
        }
        if (prop.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`Field "${key}" expected boolean, got ${typeof value}`);
        }
        if (prop.type === 'array' && !Array.isArray(value)) {
          errors.push(`Field "${key}" expected array, got ${typeof value}`);
        }
        if (prop.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
          errors.push(`Field "${key}" expected object, got ${typeof value}`);
        }

        // Validate enum
        if (prop.enum && !prop.enum.includes(value)) {
          errors.push(`Field "${key}" must be one of [${prop.enum.join(', ')}], got "${value}"`);
        }

        // Validate min/max for numbers
        if (prop.minimum !== undefined && typeof value === 'number' && value < prop.minimum) {
          errors.push(`Field "${key}" must be >= ${prop.minimum}, got ${value}`);
        }
        if (prop.maximum !== undefined && typeof value === 'number' && value > prop.maximum) {
          errors.push(`Field "${key}" must be <= ${prop.maximum}, got ${value}`);
        }

        // Validate minLength/maxLength for strings
        if (prop.minLength !== undefined && typeof value === 'string' && value.length < prop.minLength) {
          errors.push(`Field "${key}" length must be >= ${prop.minLength}`);
        }
        if (prop.maxLength !== undefined && typeof value === 'string' && value.length > prop.maxLength) {
          errors.push(`Field "${key}" length must be <= ${prop.maxLength}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      data,
    };
  }

  /**
   * Assert response matches expected structure
   * Throws on mismatch
   */
  static assertResponseMatch(actual, expected) {
    const mismatches = [];

    for (const [key, expectedValue] of Object.entries(expected)) {
      if (actual[key] === undefined) {
        mismatches.push(`Missing field: "${key}"`);
        continue;
      }

      if (typeof expectedValue === 'object' && expectedValue !== null && !Array.isArray(expectedValue)) {
        // Recursive check for nested objects
        const nested = ResponseValidator.assertResponseMatch(actual[key], expectedValue);
        if (nested.length > 0) {
          mismatches.push(...nested.map((m) => `${key}.${m}`));
        }
      } else if (actual[key] !== expectedValue) {
        mismatches.push(`Field "${key}": expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actual[key])}`);
      }
    }

    if (mismatches.length > 0) {
      const err = new Error(`Response mismatch:\n  ${mismatches.join('\n  ')}`);
      err.mismatches = mismatches;
      throw err;
    }

    return mismatches;
  }
}

module.exports = { ResponseValidator };
