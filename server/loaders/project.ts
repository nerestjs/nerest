import path from 'path';
import fs from 'fs/promises';

export type Project = {
  name: string;
  description?: string;
  version?: string;
  homepage?: string;
  repository?: string | { url?: string };
};

// Loads project meta information and available apps
export async function loadProject(root: string) {
  const packageJson = await fs.readFile(
    path.join(root, 'package.json'),
    'utf-8'
  );
  const {
    name = '',
    description,
    version,
    homepage,
    repository,
  } = JSON.parse(packageJson);

  if (!name) {
    console.warn(
      '"name" is not set in package.json, this may cause conflicts when hydrating multiple apps from different micro frontends'
    );
  }

  return { name, description, version, homepage, repository };
}
