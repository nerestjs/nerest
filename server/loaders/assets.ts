import type { Manifest } from 'vite';

// TODO: this is not as simple in the real world
const publicPath = process.env.PUBLIC_PATH ?? 'http://0.0.0.0:3000/';

// Extracts the list of assets for a given app from the manifest file
export function loadAppAssets(manifest: Manifest, appName: string) {
  const entries = Object.entries(manifest);

  // TODO: handling errors and potentially missing entries
  const clientEntryJs = entries.find(([_, entry]) => entry.isEntry)?.[1].file;
  const appCss =
    entries.find(([name, _]) => name.includes(`/${appName}/index.tsx`))?.[1]
      .css ?? [];

  return [clientEntryJs, ...appCss].map((x) => publicPath + x);
}
