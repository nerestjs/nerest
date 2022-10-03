// This is the nerest server entrypoint
import fastify from 'fastify';
import vite from 'vite';

async function createServer() {
  const root = process.cwd();

  const viteSsr = vite.createServer({ root, appType: 'custom' });

  const app = fastify();

  app.get('/ping', () => 'pong');

  return { app };
}

createServer().then(async ({ app }) => {
  await app.listen({ port: 3000 });
  console.log('Nerest is listening on port 3000');
});
