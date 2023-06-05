import type { Manifest } from 'vite';

// Extracts the list of assets for a given app from the manifest file
export function loadAppAssets(
  appName: string,
  manifest: Manifest,
  staticPath: string
) {
  // TODO: handling errors and potentially missing entries
  // All apps share the same JS entry that dynamically imports the chunks of the apps
  // that are used on the page based on their name
  const clientEntryJs =
    manifest['node_modules/@nerest/nerest/client/index.ts'].file;

  // Each app has its own CSS bundles, if it imports any CSS
  const appCss = manifest[`apps/${appName}/index.tsx`].css ?? [];

  return [clientEntryJs, ...appCss].map((x) => staticPath + x);
}
