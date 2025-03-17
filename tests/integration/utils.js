import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const HARNESS_DIR = join(__dirname, 'harness');
export const BASE_URL = 'http://127.0.0.1:3000';

export async function waitForServerReady(server) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Server failed to start within 10 seconds'));
    }, 10000);

    server.stdout?.on('data', (data) => {
      if (
        data.toString().includes('Server listening at http://127.0.0.1:3000')
      ) {
        clearTimeout(timeout);
        resolve();
      }
    });
  });
}
