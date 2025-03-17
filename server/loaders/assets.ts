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
  const appCss = collectCssUrls(manifest, `apps/${appName}/index.tsx`);

  return [clientEntryJs, ...appCss].map((x) => new URL(x, staticPath).href);
}

// Collects all CSS URLs by walking the manifest tree of static imports
// for a specific entry. These CSS chunks are loaded dynamically by Vite,
// but we need to inject them into the page statically to prevent a flash
// of unstyled content
function collectCssUrls(manifest: Manifest, entryName: string) {
  const cssUrls = new Set<string>();
  const scannedEntries = new Set([entryName]);
  const queue = [entryName];

  while (queue.length > 0) {
    const entry = queue.shift()!;
    const manifestEntry = manifest[entry];

    if (manifestEntry) {
      manifestEntry.css?.forEach((url) => cssUrls.add(url));

      manifestEntry.imports?.forEach((name) => {
        if (!scannedEntries.has(name)) {
          scannedEntries.add(name);
          queue.push(name);
        }
      });
    }
  }

  return cssUrls;
}
