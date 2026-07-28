import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const SERVER_ENTRY = path.join('build', 'server.mjs');

export async function start() {
  spawnServer(resolveStartArgs());
}

// Resolve the arguments passed to `node` when starting the production server.
export function resolveStartArgs(root: string = process.cwd()): string[] {
  const preloadBundle = path.join(root, 'build', 'preload.mjs');

  if (existsSync(preloadBundle)) {
    // `--import` expects a module specifier; a file URL is the portable form.
    return ['--import', pathToFileURL(preloadBundle).href, SERVER_ENTRY];
  }

  return [SERVER_ENTRY];
}

// Spawn `node` with the given args as a child process, forwarding termination
// signals so that graceful shutdown runs.
export function spawnServer(args: string[], env?: NodeJS.ProcessEnv) {
  const child = spawn(process.execPath, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });

  const forwardSignal = (signal: NodeJS.Signals) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  const forwardSigterm = () => forwardSignal('SIGTERM');
  const forwardSigint = () => forwardSignal('SIGINT');

  process.on('SIGTERM', forwardSigterm);
  process.on('SIGINT', forwardSigint);

  child.on('exit', (code, signal) => {
    process.off('SIGTERM', forwardSigterm);
    process.off('SIGINT', forwardSigint);

    if (signal) {
      // Re-raise the signal so our exit status reflects how the child died.
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });

  return child;
}
