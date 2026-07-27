import type { FastifyBaseLogger } from 'fastify';

type PreloadHookModule = {
  startup?: () => unknown;
  shutdown?: () => unknown;
};

// Load the preload module, tolerating its absence. Unlike the runtime hook,
// the preload module lives in a separate bundle that is `--import`ed before
// the server (see `nerest start`), so here we only reach for its optional
// `startup`/`shutdown` lifecycle handlers.
async function loadPreloadModule(
  loader: () => Promise<unknown>
): Promise<PreloadHookModule | undefined> {
  try {
    return (await loader()) as PreloadHookModule;
  } catch {
    return undefined;
  }
}

// Run the preload module's `startup` handler, if it exports one. Called as
// early as possible during server start.
export async function runPreloadStartupHook(
  logger: FastifyBaseLogger,
  loader: () => Promise<unknown>
) {
  const module = await loadPreloadModule(loader);

  if (typeof module?.startup === 'function') {
    try {
      await module.startup();
      logger.info('Preload startup hook executed');
    } catch (e) {
      logger.fatal(e, 'Failed to execute preload startup hook');
      process.exit(1);
    }
  }
}

// Run the preload module's `shutdown` handler, if it exports one. Called late
// during graceful shutdown.
export async function runPreloadShutdownHook(
  logger: FastifyBaseLogger,
  loader: () => Promise<unknown>
) {
  const module = await loadPreloadModule(loader);

  if (typeof module?.shutdown === 'function') {
    try {
      await module.shutdown();
      logger.info('Preload shutdown hook executed');
    } catch (e) {
      logger.error(e, 'Failed to execute preload shutdown hook');
    }
  }
}
