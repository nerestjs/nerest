import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import { spawnServer } from './start.js';

const PRELOAD_SOURCE_ENTRY = path.join('nerest', 'preload.ts');

const PRELOAD_BUILDER_ENTRY = fileURLToPath(
  new URL('../build/preload-cli.js', import.meta.url)
);

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
    await buildPreloadBundleInChildProcess(root, '/');

    const preloadBundle = pathToFileURL(
      path.join(root, 'build', 'preload.mjs')
    ).href;

    spawnServer(['--import', preloadBundle, process.argv[1], 'watch'], {
      [WATCH_CHILD_ENV]: '1',
    });
    return;
  }

  console.log('Starting Nerest watch...');

  const { runDevelopmentServer } = await import('../server/development.js');
  await runDevelopmentServer(
    process.env.PORT ? Number(process.env.PORT) : 3000
  );
}

// Build the preload bundle in a throwaway `node`, so that the Vite instance it
// needs is freed on exit rather than retained for the lifetime of this process.
export function buildPreloadBundleInChildProcess(root: string, base: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [PRELOAD_BUILDER_ENTRY, root, base], {
      stdio: 'inherit',
    });

    child.on('error', reject);

    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Preload build failed with ${signal ? `signal ${signal}` : `exit code ${code}`}`
          )
        );
      }
    });
  });
}
