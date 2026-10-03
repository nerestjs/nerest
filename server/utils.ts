import crypto from 'crypto';

// Generate a random string ID 20 characters long
export function randomId() {
  return crypto.randomBytes(10).toString('hex');
}

export const escapeMap: Record<string, string> = {
  '<': '\\u003c',
};

/*
 * Escapes '<' to prevent early </script> tag termination when injecting JSON into HTML script tags.
 * On the client side, JSON.parse automatically restores '\u003c' back to '<'.
 */
export function stringifyForInjectAsRawToScript(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, (c) => escapeMap[c]);
}
