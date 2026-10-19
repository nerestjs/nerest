import { describe, it, expect, vi } from 'vitest';
import { glob } from 'tinyglobby';
import { loadAppDirectories } from '../../../server/loaders/directories.js';

vi.mock('tinyglobby', () => ({
  glob: vi.fn(),
  convertPathToPattern: vi.fn((path) => path),
}));

vi.mock('../../../server/loaders/manifest.js');
vi.mock('../../../server/loaders/assets.js');
vi.mock('../../../server/loaders/examples.js');
vi.mock('../../../server/loaders/schema.js');

describe('loadAppDirectories', () => {
  it('should load app directories', async () => {
    vi.mocked(glob).mockResolvedValue(['/root/apps/app1', '/root/apps/app2']);

    const appDirectories = await loadAppDirectories('/root');

    expect(glob).toHaveBeenCalledWith('/root/apps/*', {
      onlyDirectories: true,
      absolute: true,
      expandDirectories: false,
    });

    expect(appDirectories).toEqual(['/root/apps/app1', '/root/apps/app2']);
  });

  it('should strip trailing slashes from directory paths', async () => {
    vi.mocked(glob).mockResolvedValue(['/root/apps/app1/']);

    const appDirectories = await loadAppDirectories('/root');

    expect(appDirectories).toEqual(['/root/apps/app1']);
  });
});
