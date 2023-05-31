import { createDevelopmentServer } from '../server/development';

// Start dev server in watch mode, that restarts on file change
// and rebuilds the client static files
export async function watch() {
  // TODO: will be replaced with nerest logger
  console.log('Starting Nerest watch...');

  const { app } = await createDevelopmentServer();

  // TODO: remove hardcoded port
  await app.listen({
    host: '0.0.0.0',
    port: 3000,
  });

  console.log('Nerest is listening on 0.0.0.0:3000');
}
