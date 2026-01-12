import type { FastifyInstance } from 'fastify';

type RuntimeHookModule = {
  default: (app: FastifyInstance) => unknown;
};

// Load the runtime hook module and run it if it exists, passing down our
// fastify instance. This hook can be used to modify fastify settings, add
// plugins or routes on an individual app level.
export async function runRuntimeHook(
  app: FastifyInstance,
  loader: () => Promise<unknown>
) {
  let module: RuntimeHookModule | undefined;

  try {
    module = (await loader()) as RuntimeHookModule;
  } catch {}

  if (typeof module?.default === 'function') {
    // If module exists and exports a default function, execute it and
    // pass down the fastify instance
    try {
      await module.default(app);
    } catch (e) {
      app.log.fatal(e, 'Failed to execute runtime hook');
      process.exit(1);
    }
  } else if (module) {
    app.log.fatal("Runtime hook found, but doesn't export default function!");
    process.exit(1);
  } else {
    app.log.info('Runtime hook not found, skipping...');
  }
}
