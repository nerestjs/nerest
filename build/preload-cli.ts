// Internal entrypoint, spawned by `nerest watch`. Building the preload bundle
// pulls in Vite, so it happens in a throwaway process that frees it on exit
// instead of in the long-lived parent.
import { buildPreloadBundle } from './preload.js';

const [root, base] = process.argv.slice(2);

await buildPreloadBundle(root, base);
