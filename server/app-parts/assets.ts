import type { Manifest } from 'vite';

// TODO: way more complicated in the real world
const publicPath = process.env.PUBLIC_PATH ?? 'http://127.0.0.1:3000/';

export function loadAppAssets(manifest: Manifest, appName: string) {
  const entries = Object.entries(manifest);

  const clientEntryJs = entries.find(([_, entry]) => entry.isEntry)?.[1].file;
  const appCss =
    entries.find(([name, _]) => name.includes(`/${appName}/index.tsx`))?.[1]
      .css ?? [];

  return [clientEntryJs, ...appCss].map((x) => publicPath + x);
}
