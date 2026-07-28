import { build } from 'vite';

import { loadBuildConfig } from '../server/loaders/build.js';
import { loadAppDirectories } from '../server/loaders/directories.js';
import { loadProject } from '../server/loaders/project.js';
import { viteConfigProductionPreload } from './configs/production.js';

export async function buildPreloadBundle(root: string, base: string) {
  const buildConfig = await loadBuildConfig(root);
  const project = await loadProject(root);
  const appDirectories = await loadAppDirectories(root);

  const preloadViteConfig = await viteConfigProductionPreload({
    root,
    base,
    buildConfig,
    project,
    appDirectories,
  });
  console.log('Producing preload build...');
  await build(preloadViteConfig);
}
