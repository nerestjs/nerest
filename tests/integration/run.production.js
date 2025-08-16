import { execa } from 'execa';
import { HARNESS_DIR, waitForServerReady } from './utils.js';

async function main() {
  // Install dependencies in harness
  console.log('Installing harness dependencies...');
  await execa('npm', ['install'], {
    cwd: HARNESS_DIR,
    stdio: 'inherit',
  });

  // Create production build
  console.log('Creating production build...');
  await execa('npm', ['run', 'build'], {
    cwd: HARNESS_DIR,
    env: { STATIC_PATH: 'http://127.0.0.1:3000' },
    stdio: 'inherit',
  });

  // Start the production server
  console.log('Starting production server...');
  const server = execa('node', ['build/server.mjs'], {
    cwd: HARNESS_DIR,
    env: { ENABLE_K8S_PROBES: 'true' },
    forceKillAfterDelay: 2000,
  });
  server.stdout?.pipe(process.stdout);
  server.stderr?.pipe(process.stderr);

  try {
    // Wait for server to be ready
    console.log('Waiting for server to be ready...');
    await waitForServerReady(server);

    // Run the tests
    console.log('Running integration tests...');
    await execa(
      'node_modules/.bin/vitest',
      [
        'run',
        'tests/integration/suites/',
        '--exclude',
        'tests/integration/suites/browser.test.ts', // browser tests require a static server
      ],
      { stdio: 'inherit' }
    );
  } finally {
    server.kill();
    try {
      await server;
    } catch {}
  }
}

main().catch(async (error) => {
  console.error('Integration tests failed:', error);
  process.exit(1);
});
