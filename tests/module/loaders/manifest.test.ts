import { describe, it, expect, vi } from 'vitest';
import fs from 'fs/promises';
import {
  loadViteManifest,
  loadNerestManifest,
} from '../../../server/loaders/manifest.js';

vi.mock('fs/promises');

describe('manifest loaders', () => {
  it('should load vite manifest from correct path', async () => {
    const mockManifest = {
      'app.tsx': { file: 'app.js' },
    };
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockManifest));

    const manifest = await loadViteManifest('/root');

    expect(fs.readFile).toHaveBeenCalledWith(
      '/root/build/client/assets/.vite/manifest.json',
      'utf-8'
    );
    expect(manifest).toEqual(mockManifest);
  });

  it('should load nerest manifest from correct path', async () => {
    const mockManifest = {
      project: { name: 'test' },
      apps: { app1: { entry: 'app.tsx' } },
    };
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockManifest));

    const manifest = await loadNerestManifest('/root');

    expect(fs.readFile).toHaveBeenCalledWith(
      '/root/build/nerest-manifest.json',
      'utf-8'
    );
    expect(manifest).toEqual(mockManifest);
  });
});
