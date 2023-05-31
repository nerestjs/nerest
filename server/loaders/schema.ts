import path from 'path';
import { existsSync } from 'fs';
import fs from 'fs/promises';

// Loads and parses the schema file for a specific app
export async function loadAppSchema(appRoot: string) {
  const schemaPath = path.join(appRoot, 'schema.json');

  let schema = null;

  // TODO: error handling and reporting
  if (existsSync(schemaPath)) {
    const file = await fs.readFile(schemaPath, { encoding: 'utf-8' });
    schema = JSON.parse(file);
  }

  return schema;
}
