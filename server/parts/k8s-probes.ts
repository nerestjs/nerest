import type { FastifyInstance } from 'fastify';

// Setup routes for k8s probes to check if application is live
export async function setupK8SProbes(app: FastifyInstance) {
  // Handler for graceful shutdowns
  // K8s can initiate shutdown at any moment: on pods restart or on deploy.
  // So, if we receive shutdown request, we:
  // - starts to send 503 response code on readiness probes to stop receiving requests
  // - finishes all current requests
  // - shuts down the server
  let isShutdownInProgress = false;

  app.gracefulShutdown(() => {
    app.log.info('Graceful shutdown in process...');
    isShutdownInProgress = true;
  });

  app.get(
    '/livenessProbe',
    {
      schema: { tags: ['@service'] },
      logLevel: 'silent',
    },
    (req, res) => {
      res.status(200).send();
    }
  );

  app.get(
    '/readinessProbe',
    {
      schema: { tags: ['@service'] },
      logLevel: 'silent',
    },
    (req, res) => {
      if (isShutdownInProgress) {
        res.status(503).send({ status: 'Shutdown in progress' });
      } else {
        res.status(200).send();
      }
    }
  );
}
