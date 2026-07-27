import type { FastifyInstance } from 'fastify';

// Exposes the preload hook state (recorded by nerest/preload.ts) over HTTP so
// integration tests can assert that the preload module was imported and its
// startup handler ran inside the live server.
export default function (app: FastifyInstance) {
  app.get('/preload-status', { logLevel: 'silent' }, async () => {
    const state = (globalThis as any).__NEREST_PRELOAD__ ?? {};
    return {
      imported: Boolean(state.imported),
      startup: Boolean(state.startup),
    };
  });
}
