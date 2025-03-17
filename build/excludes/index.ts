/**
 * Maps list of imports into a list of rollup aliases that resolve
 * into an empty module.
 */
export function excludes(list: string[] | undefined) {
  return list?.map((exclude) => ({
    // Excluding '@some/package' should exclude both '@some/package' and
    // '@some/package/...` imports
    find: new RegExp(`^${escapeRegExp(exclude)}($|\\/.*)`),
    replacement: '@nerest/nerest/build/excludes/empty-module',
  }));
}

/**
 * Escapes string to use inside of a regular expression.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 */
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
