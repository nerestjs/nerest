import path from 'path';
import fs from 'fs/promises';
import type { Manifest } from 'vite';

import { loadAppAssets } from './app-parts/assets';
import { loadAppExamples } from './app-parts/examples';

type AppEntry = [
  name: string,
  entry: {
    root: string;
    entry: string;
    assets: string[];
    examples: Record<string, unknown>;
  }
];

export async function loadApps(root: string) {
  const appsRoot = path.join(root, 'apps');
  const manifest = await loadManifest(root);

  const appsDirs = (await fs.readdir(appsRoot, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const apps: AppEntry[] = [];
  for (const appDir of appsDirs) {
    apps.push(await loadApp(appsRoot, appDir, manifest));
  }

  return Object.fromEntries(apps);
}

async function loadApp(
  appsRoot: string,
  name: string,
  manifest: Manifest
): Promise<AppEntry> {
  const appRoot = path.join(appsRoot, name);
  return [
    name,
    {
      root: appRoot,
      entry: path.join(appRoot, 'index.tsx'),
      assets: loadAppAssets(manifest, name),
      examples: await loadAppExamples(appRoot),
    },
  ];
}

async function loadManifest(root: string) {
  const manifestPath = path.join(root, 'dist', 'manifest.json');
  const manifestData = await fs.readFile(manifestPath, { encoding: 'utf8' });
  return JSON.parse(manifestData);
}
