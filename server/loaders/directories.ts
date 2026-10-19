import path from 'path';
import { convertPathToPattern, glob } from 'tinyglobby';

// Load app directories following the `apps/{name}` convention
export async function loadAppDirectories(root: string) {
  const appBase = path.join(root, 'apps');
  const appPattern = `${convertPathToPattern(appBase)}/*`;
  const directories = await glob(appPattern, {
    onlyDirectories: true,
    absolute: true,
    expandDirectories: false,
  });

  // Directory matches have a trailing slash, strip it so that the
  // paths can be joined with file names
  return directories.map((dir) => path.resolve(dir));
}
