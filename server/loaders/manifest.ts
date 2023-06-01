import path from 'path';
import fs from 'fs/promises';

// Manifest is used to provide assets list for every app
// for use with SSR
export async function loadAppManifest(root: string) {
  // TODO: error handling
  const manifestPath = path.join(root, 'build', 'manifest.json');
  const manifestData = await fs.readFile(manifestPath, { encoding: 'utf8' });
  return JSON.parse(manifestData);
}
