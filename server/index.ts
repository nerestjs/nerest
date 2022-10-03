// This is the nerest server entrypoint
import fastify from 'fastify';
import vite from 'vite';

export async function createServer() {
  const root = process.cwd();

  const viteSsr = vite.createServer({ root, appType: 'custom' });

  const app = fastify();

  app.get('/ping', () => 'pong');

  return { app };
}
