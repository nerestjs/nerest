import { runDevelopmentServer } from '../server/development.js';

// Start dev server in watch mode, that restarts on file change
// and rebuilds the client static files
export async function watch() {
  console.log('Starting Nerest watch...');
  await runDevelopmentServer(
    process.env.PORT ? Number(process.env.PORT) : 3000
  );
}
