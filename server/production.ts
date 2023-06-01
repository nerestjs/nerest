// This is the nerest production server entrypoint
import fastify from 'fastify';

import { loadAppManifest } from './loaders/manifest';
import { loadAppAssets } from './loaders/assets';

import { renderApp } from './parts/render';

async function runProductionServer() {
  const apps = import.meta.glob('/apps/*/index.tsx', {
    import: 'default',
    eager: true,
  }) as Record<string, React.ComponentType>;

  const root = process.cwd();
  const manifest = await loadAppManifest(root);

  const app = fastify();

  // TODO: figure out how to import swagger so it doesn't break the build with npm link
  // await setupSwagger(app);

  for (const [pathname, component] of Object.entries(apps)) {
    const name = pathname.split('/')[2];
    const assets = loadAppAssets(manifest, name);

    // POST /api/{name} -> render app with request.body as props
    app.post(`/api/${name}`, (request) =>
      renderApp(
        { name, assets, component },
        request.body as Record<string, unknown>
      )
    );
  }

  // TODO: remove hardcoded port
  await app.listen({
    host: '0.0.0.0',
    port: 3000,
  });

  console.log('Nerest is listening on 0.0.0.0:3000');
}

runProductionServer();
