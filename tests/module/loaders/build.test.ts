import { describe, it, expect, vi } from 'vitest';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { loadBuildConfig } from '../../../server/loaders/build.js';

vi.mock('fs/promises');
vi.mock('fs');

describe('loadBuildConfig', () => {
  const mockConfig = {
    apps: {
      'test-app': {
        entry: 'apps/test-app/index.tsx',
      },
    },
  };

  it('should load build config when it exists', async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));

    const config = await loadBuildConfig('/test/root');

    expect(existsSync).toHaveBeenCalledWith('/test/root/nerest/build.json');
    expect(fs.readFile).toHaveBeenCalledWith(
      '/test/root/nerest/build.json',
      'utf-8'
    );
    expect(config).toEqual(mockConfig);
  });

  it('should return undefined when config does not exist', async () => {
    vi.mocked(existsSync).mockReturnValue(false);

    const config = await loadBuildConfig('/test/root');

    expect(existsSync).toHaveBeenCalledWith('/test/root/nerest/build.json');
    expect(fs.readFile).not.toHaveBeenCalled();
    expect(config).toBeUndefined();
  });
});
