import type { Manifest } from 'vite';

// TODO: this is not as simple in the real world, & remove hardcoded port
// The path where the client files are deployed can be built-in during the initial build,
// but the client scripts aren't using it, so maybe it should be a runtime env variable
// for the server instead?
// TODO: figure this out
const publicPath = process.env.PUBLIC_PATH ?? 'http://0.0.0.0:3000/';

// Extracts the list of assets for a given app from the manifest file
export function loadAppAssets(manifest: Manifest, appName: string) {
  // TODO: handling errors and potentially missing entries
  // All apps share the same JS entry that dynamically imports the chunks of the apps
  // that are used on the page based on their name
  const clientEntryJs =
    manifest['node_modules/@nerest/nerest/client/index.ts'].file;

  // Each app has its own CSS bundles, if it imports any CSS
  const appCss = manifest[`apps/${appName}/index.tsx`].css ?? [];

  return [clientEntryJs, ...appCss].map((x) => publicPath + x);
}
