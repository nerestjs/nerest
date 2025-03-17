import path from 'path';
import fs from 'fs/promises';

import { build } from 'vite';

import { loadBuildConfig } from '../server/loaders/build.js';
import { loadApps } from '../server/loaders/apps.js';
import type { Project } from '../server/loaders/project.js';
import { loadProject } from '../server/loaders/project.js';
import {
  viteConfigProductionClient,
  viteConfigProductionServer,
} from './configs/production.js';

export async function buildMicroFrontend() {
  const root = process.cwd();
  const staticPath = prepareStaticPath();

  // Read build customizations from nerest/build.json
  const buildConfig = await loadBuildConfig(root);

  // Read project meta info from package.json
  const project = await loadProject(root);

  // Build client
  const clientViteConfig = await viteConfigProductionClient({
    root,
    base: staticPath,
    buildConfig,
    project,
  });
  console.log('Producing production client build...');
  await build(clientViteConfig);

  // Create nerest-manifest.json that production server reads on startup
  console.log('Producing Nerest manifest file...');
  await createNerestManifest(root, staticPath, project);

  // Build server
  const serverViteConfig = await viteConfigProductionServer({
    root,
    base: staticPath,
    buildConfig,
    project,
  });
  console.log('Producing production server build...');
  await build(serverViteConfig);
}

async function createNerestManifest(
  root: string,
  staticPath: string,
  project: Project
) {
  const apps = await loadApps(root, staticPath);
  await fs.writeFile(
    path.join(root, 'build/nerest-manifest.json'),
    JSON.stringify({ project, apps }),
    'utf-8'
  );
}

function prepareStaticPath() {
  let staticPath = process.env.STATIC_PATH;

  // The path where the client files are deployed is embedded
  // during the initial build.
  // TODO: handle error if STATIC_PATH isn't a valid base URL
  if (!staticPath) {
    throw new Error(
      'STATIC_PATH environment variable is not set but is required for the production build'
    );
  }

  // Static path is a directory URI. To be treated as such by node:url,
  // it has to end with a trailing slash
  if (!staticPath.endsWith('/')) {
    staticPath += '/';
  }

  return staticPath;
}
