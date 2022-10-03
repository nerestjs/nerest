import { createServer } from '../server';

export async function watch() {
  console.log('Starting Nerest watch...');

  const { app } = await createServer();

  await app.listen({ port: 3000 });

  console.log('Nerest is listening on port 3000');
}
