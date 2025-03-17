import type { InlineConfig } from 'vite';

import type { BuildConfiguration } from '../../schemas/nerest-build.schema.js';
import type { Project } from '../../server/loaders/project.js';

export type BuildArgs = {
  root: string;
  base: string;
  buildConfig: BuildConfiguration | undefined;
  project: Project;
};

export async function viteConfigShared({
  root,
  base,
  buildConfig,
  project,
}: BuildArgs): Promise<InlineConfig> {
  // This will be available to client scripts with import.meta.env
  process.env.NEREST_PROJECT_NAME = project.name;
  process.env.NEREST_CLIENT_SIDE_EFFECTS = JSON.stringify(
    buildConfig?.clientSideEffects ?? []
  );

  return {
    root,
    base,
    appType: 'custom',
    envPrefix: 'NEREST_',
    css: {
      postcss: {
        // postcss plugins - import modules mentioned in buildConfig.postcss.plugins
        plugins: await loadPostcssPlugins(buildConfig?.postcss?.plugins),
      },
    },
  };
}

async function loadPostcssPlugins(
  plugins: Record<string, unknown> | undefined
) {
  if (!plugins) {
    return undefined;
  }

  const imports = Object.entries(plugins).map(async ([name, options]) =>
    (await import(name)).default(options)
  );

  return Promise.all(imports);
}
