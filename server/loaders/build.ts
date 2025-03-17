import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

import type { BuildConfiguration } from '../../schemas/nerest-build.schema.js';

// TODO: error handling
export async function loadBuildConfig(root: string) {
  const configPath = path.join(root, 'nerest/build.json');
  if (existsSync(configPath)) {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content) as BuildConfiguration;
  }
}
