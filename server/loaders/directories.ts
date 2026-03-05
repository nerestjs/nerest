import path from 'path';
import fg from 'fast-glob';

// Load app directories following the `apps/{name}` convention
export async function loadAppDirectories(root: string) {
  const appBase = path.join(root, 'apps');
  const appPattern = `${fg.convertPathToPattern(appBase)}/*`;
  return fg.glob(appPattern, { onlyDirectories: true });
}
