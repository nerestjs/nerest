import path from 'path';
import fs from 'fs/promises';

export async function loadApps(root: string) {
  const appsRoot = path.join(root, 'apps');

  const appsDirs = (await fs.readdir(appsRoot, { withFileTypes: true })).filter(
    (d) => d.isDirectory()
  );

  const apps = appsDirs.map((d) => {
    const appRoot = path.join(appsRoot, d.name);
    return [
      d.name,
      {
        root: appRoot,
        entry: path.join(appRoot, 'index.tsx'),
      },
    ] as [string, { root: string; entry: string }];
  });

  return Object.fromEntries(apps);
}
