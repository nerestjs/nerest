import { existsSync } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

import { runDevelopmentServer } from '../server/development.js';
import { buildPreloadBundle } from '../build/preload.js';
import { spawnServer } from './start.js';

const PRELOAD_SOURCE_ENTRY = path.join('nerest', 'preload.ts');

// Set on the re-launched child so it runs the dev server instead of
// recursively rebuilding and re-launching the preload bundle.
const WATCH_CHILD_ENV = 'NEREST_WATCH_CHILD';

// Start dev server in watch mode, that restarts on file change
// and rebuilds the client static files.
export async function watch() {
  const root = process.cwd();

  // If the micro frontend has a `nerest/preload.ts`, we build it and re-launch
  // ourselves in a child `node` that `--import`s the bundle before anything else.
  if (!process.env[WATCH_CHILD_ENV] && existsSync(PRELOAD_SOURCE_ENTRY)) {
    await buildPreloadBundle(root, '/');

    const preloadBundle = pathToFileURL(
      path.join(root, 'build', 'preload.mjs')
    ).href;

    spawnServer(['--import', preloadBundle, process.argv[1], 'watch'], {
      [WATCH_CHILD_ENV]: '1',
    });
    return;
  }

  console.log('Starting Nerest watch...');
  await runDevelopmentServer(
    process.env.PORT ? Number(process.env.PORT) : 3000
  );
}
