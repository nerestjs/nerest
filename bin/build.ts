import { buildMicroFrontend } from '../build/index.js';

// Produce the production build of the Nerest micro frontend
export async function build() {
  console.log('Nerest is preparing production build...');
  await buildMicroFrontend();
  console.log('Nerest build is finished');
}
