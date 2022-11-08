import path from 'path';
import fs from 'fs/promises';
import type { Manifest } from 'vite';

// TODO: way more complicated in the real world
const publicPath = process.env.PUBLIC_PATH ?? 'http://127.0.0.1:3000/';

export async function loadApps(root: string) {
  const appsRoot = path.join(root, 'apps');
  const manifest = await loadManifest(root);

  const appsDirs = (await fs.readdir(appsRoot, { withFileTypes: true })).filter(
    (d) => d.isDirectory()
  );

  const apps = appsDirs.map((d) => {
    const appRoot = path.join(appsRoot, d.name);
    return [
      d.name,
      {
        root: appRoot,
        entry: path.join(appRoot, 'index.tsx'),
        assets: getAppAssets(manifest, d.name),
      },
    ] as [string, { root: string; entry: string; assets: string[] }];
  });

  return Object.fromEntries(apps);
}

async function loadManifest(root: string) {
  const manifestPath = path.join(root, 'dist', 'manifest.json');
  const manifestData = await fs.readFile(manifestPath, { encoding: 'utf8' });
  return JSON.parse(manifestData);
}

function getAppAssets(manifest: Manifest, appName: string) {
  const entries = Object.entries(manifest);

  const clientEntryJs = entries.find(([_, entry]) => entry.isEntry)?.[1].file;
  const appCss =
    entries.find(([name, _]) => name.includes(`/${appName}/index.tsx`))?.[1]
      .css ?? [];

  return [clientEntryJs, ...appCss].map((x) => publicPath + x);
}
