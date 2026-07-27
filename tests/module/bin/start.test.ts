import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import { resolveStartArgs } from '../../../bin/start.js';

describe('resolveStartArgs', () => {
  let root: string;

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'nerest-start-'));
    await fs.mkdir(path.join(root, 'build'), { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });

  it('should start the server directly when no preload bundle exists', () => {
    expect(resolveStartArgs(root)).toEqual([path.join('build', 'server.mjs')]);
  });

  it('should --import the preload bundle when it exists', async () => {
    const preloadBundle = path.join(root, 'build', 'preload.mjs');
    await fs.writeFile(preloadBundle, '// preload', 'utf-8');

    expect(resolveStartArgs(root)).toEqual([
      '--import',
      pathToFileURL(preloadBundle).href,
      path.join('build', 'server.mjs'),
    ]);
  });
});
