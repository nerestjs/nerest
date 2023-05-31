import Ajv from 'ajv';
import fastUri from 'fast-uri';
import addFormats from 'ajv-formats';

export const validator = new Ajv({
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
addFormats(validator);
