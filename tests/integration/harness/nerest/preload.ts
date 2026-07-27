// Preload hook used by the integration harness to verify that Nerest bundles
// and runs `nerest/preload.ts` before the server. State is recorded on
// globalThis so it can be surfaced over HTTP by nerest/runtime.ts.

type PreloadState = {
  imported?: boolean;
  startup?: boolean;
  shutdown?: boolean;
};

(globalThis as any).__NEREST_PRELOAD__ ??= {};
const state: PreloadState = (globalThis as any).__NEREST_PRELOAD__;

// Top-level side effect: runs when the module is imported (via `--import` in
// production, or on first load in development).
state.imported = true;

export function startup() {
  state.startup = true;
  console.log('PRELOAD_STARTUP_OK');
}

export function shutdown() {
  state.shutdown = true;
  console.log('PRELOAD_SHUTDOWN_OK');
}
