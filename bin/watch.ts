import { runDevelopmentServer } from '../server/development';

// Start dev server in watch mode, that restarts on file change
// and rebuilds the client static files
export async function watch() {
  // TODO: will be replaced with nerest logger
  console.log('Starting Nerest watch...');
  await runDevelopmentServer();
}
