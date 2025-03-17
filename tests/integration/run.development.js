import { execa } from 'execa';
import { HARNESS_DIR, waitForServerReady } from './utils.js';

async function main() {
  // Install dependencies in harness
  console.log('Installing harness dependencies...');
  await execa('npm', ['install'], {
    cwd: HARNESS_DIR,
    stdio: 'inherit',
  });

  // Install Playwright browsers
  // TODO: Playwright tests hang in Devplatform CI, disable them for now
  if (!process.env.GITLAB_CI) {
    console.log('Installing Playwright browsers...');
    await execa(
      'npx',
      ['playwright', 'install', 'chromium', '--with-deps', '--no-shell'],
      { stdio: 'inherit' }
    );
  }

  // Start the dev server
  console.log('Starting development server...');
  const server = execa('npm', ['run', 'watch'], {
    cwd: HARNESS_DIR,
    env: { ENABLE_K8S_PROBES: 'true' },
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
        // TODO: Playwright tests hang in Devplatform CI, disable them for now
        ...(process.env.GITLAB_CI
          ? ['--exclude', 'tests/integration/suites/browser.test.ts']
          : []),
      ],
      { stdio: 'inherit' }
    );
  } finally {
    server.kill();
  }
}

main().catch(async (error) => {
  console.error('Integration tests failed:', error);
  process.exit(1);
});
