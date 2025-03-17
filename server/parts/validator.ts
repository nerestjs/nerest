import Ajv from 'ajv';
import fastUri from 'fast-uri';
import addFormats from 'ajv-formats';
import type { FastifyInstance } from 'fastify';

// Ajv default export is broken, so we have to specify `.default`
// manually: https://github.com/ajv-validator/ajv/issues/2132
// eslint-disable-next-line new-cap
export const validator = new Ajv.default({
  coerceTypes: 'array',
  useDefaults: true,
  removeAdditional: true,
  uriResolver: fastUri,
  addUsedSchema: false,
  // Explicitly set allErrors to `false`.
  // When set to `true`, a DoS attack is possible.
  allErrors: false,
});

// Support additional type formats in JSON schema like `date`,
// `email`, `url`, etc. Used by default in fastify
// https://www.npmjs.com/package/ajv-formats
addFormats.default(validator);

// Setup schema validation. We have to use our own ajv instance that
// we can use both to validate request bodies and examples against
// app schemas
export function setupValidator(app: FastifyInstance) {
  if (process.env.DISABLE_SCHEMA_VALIDATION) {
    // If schema validation is disabled, return data as is without any checks
    app.setValidatorCompiler(() => (data) => ({ value: data }));
  } else {
    // If schema validation is enabled, validate and coerce data via ajv
    app.setValidatorCompiler(({ schema }) => validator.compile(schema));
  }
}
