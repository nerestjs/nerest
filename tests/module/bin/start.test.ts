import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import { resolveStartPlan } from '../../../bin/start.js';

describe('resolveStartPlan', () => {
  let root: string;

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'nerest-start-'));
    await fs.mkdir(path.join(root, 'build'), { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });

  it('should run the server in-process when no preload bundle exists', () => {
    expect(resolveStartPlan(root)).toEqual({
      mode: 'in-process',
      entry: path.join(root, 'build', 'server.mjs'),
    });
  });

  it('should spawn a child that --imports the preload bundle when it exists', async () => {
    const preloadBundle = path.join(root, 'build', 'preload.mjs');
    await fs.writeFile(preloadBundle, '// preload', 'utf-8');

    expect(resolveStartPlan(root)).toEqual({
      mode: 'spawn',
      args: [
        '--import',
        pathToFileURL(preloadBundle).href,
        path.join('build', 'server.mjs'),
      ],
    });
  });
});
