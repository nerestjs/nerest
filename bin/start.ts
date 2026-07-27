import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const SERVER_ENTRY = path.join('build', 'server.mjs');

// Resolve the arguments passed to `node` when starting the production server.
// If a preload bundle was produced (i.e. the micro frontend has a
// `nerest/preload.ts`), it is `--import`ed before the server entry so that its
// top-level code runs first — this is what lets instrumentation libraries
// patch modules before the server imports them.
export function resolveStartArgs(root: string = process.cwd()): string[] {
  const preloadBundle = path.join(root, 'build', 'preload.mjs');

  if (existsSync(preloadBundle)) {
    // `--import` expects a module specifier; a file URL is the portable form.
    return ['--import', pathToFileURL(preloadBundle).href, SERVER_ENTRY];
  }

  return [SERVER_ENTRY];
}

// Start the production server. Spawns `node` (optionally preloading the
// instrumentation bundle) as a child process and forwards termination signals
// so that graceful shutdown — and the preload's `shutdown` handler — run.
export async function start() {
  const args = resolveStartArgs();

  const child = spawn(process.execPath, args, { stdio: 'inherit' });

  const forwardSignal = (signal: NodeJS.Signals) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on('SIGTERM', () => forwardSignal('SIGTERM'));
  process.on('SIGINT', () => forwardSignal('SIGINT'));

  child.on('exit', (code, signal) => {
    if (signal) {
      // Re-raise the signal so our exit status reflects how the child died.
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });
}
