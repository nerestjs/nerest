import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const SERVER_ENTRY = path.join('build', 'server.mjs');

export type StartPlan =
  | { mode: 'in-process'; entry: string }
  | { mode: 'spawn'; args: string[] };

export async function start() {
  const plan = resolveStartPlan();

  if (plan.mode === 'in-process') {
    await import(pathToFileURL(plan.entry).href);
    return;
  }

  spawnServer(plan.args);
}

// Decide how to launch the production server.
export function resolveStartPlan(root: string = process.cwd()): StartPlan {
  const preloadBundle = path.join(root, 'build', 'preload.mjs');

  if (existsSync(preloadBundle)) {
    // `--import` is what guarantees the preload's top-level code runs before
    // the server's module graph.
    return {
      mode: 'spawn',
      args: ['--import', pathToFileURL(preloadBundle).href, SERVER_ENTRY],
    };
  }

  // Without preload there's no need for a child process.
  return { mode: 'in-process', entry: path.join(root, SERVER_ENTRY) };
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
