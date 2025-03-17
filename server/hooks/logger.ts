import type { FastifyServerOptions } from 'fastify';

type LoggerHookModule = {
  logger?: () => FastifyServerOptions['logger'];
};

// Load the runtime hook module and run it if it exists, to receive
// logger configuration. If the `logger` function does not exist
// in the module, ignore it and use default configuration.
export async function runLoggerHook(loader: () => Promise<unknown>) {
  let module: LoggerHookModule | undefined;

  try {
    module = (await loader()) as LoggerHookModule;
  } catch {}

  if (typeof module?.logger === 'function') {
    // If module exists and exports a logger function, execute it
    try {
      return module.logger();
    } catch (e) {
      // Allow console.error here, because we can't app.log the error if we
      // can't create the logger in the first place.
      // eslint-disable-next-line no-console
      console.error('Failed to load logger configuration', e);
      process.exit(1);
    }
  }

  return null;
}
