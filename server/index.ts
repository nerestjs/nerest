// This is the nerest server entrypoint
import fastify from 'fastify';
import vite from 'vite';

import { loadApps } from './apps';

export async function createServer() {
  const root = process.cwd();

  const viteSsr = vite.createServer({ root, appType: 'custom' });

  const apps = await loadApps(root);
  console.log(apps);

  const app = fastify();

  app.get('/ping', () => 'pong');

  return { app };
}
