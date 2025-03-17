import path from 'path';
import fs from 'fs/promises';
import type { Manifest as ViteManifest } from 'vite';

import type { Project } from './project.js';
import type { AppEntry } from './apps.js';

// Vite manifest is used to provide assets list for every app
// for use with SSR
export async function loadViteManifest(root: string): Promise<ViteManifest> {
  // TODO: error handling
  const manifestPath = path.join(
    root,
    'build/client/assets/.vite/manifest.json'
  );
  const manifestData = await fs.readFile(manifestPath, 'utf-8');
  return JSON.parse(manifestData);
}

// Nerest manifest contains info about the whole project
// and every app within it
export async function loadNerestManifest(root: string): Promise<{
  project: Project;
  apps: Record<string, AppEntry>;
}> {
  // TODO: error handling
  const manifestPath = path.join(root, 'build/nerest-manifest.json');
  const manifestData = await fs.readFile(manifestPath, 'utf-8');
  return JSON.parse(manifestData);
}
