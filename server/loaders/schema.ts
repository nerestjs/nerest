import path from 'path';
import { existsSync } from 'fs';
import RefParser from '@apidevtools/json-schema-ref-parser';

// Loads and parses the schema file for a specific app
export async function loadAppSchema(appRoot: string) {
  const schemaPath = path.join(appRoot, 'schema.json');

  // We are using dereference to resolve $refs in schema files and
  // to resolve relative dependencies between schemas. The resolved
  // schema will be stringified and saved in the build manifest,
  // so we need it to have no circular references.
  return existsSync(schemaPath)
    ? RefParser.dereference(schemaPath, {
        dereference: {
          circular: false,
        },
      })
    : null;
}
