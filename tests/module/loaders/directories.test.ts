import { describe, it, expect, vi } from 'vitest';
import fg from 'fast-glob';
import { loadAppDirectories } from '../../../server/loaders/directories.js';

vi.mock('fast-glob', () => ({
  default: {
    glob: vi.fn(),
    convertPathToPattern: vi.fn((path) => path),
  },
}));

vi.mock('../../../server/loaders/manifest.js');
vi.mock('../../../server/loaders/assets.js');
vi.mock('../../../server/loaders/examples.js');
vi.mock('../../../server/loaders/schema.js');

describe('loadAppDirectories', () => {
  it('should load app directories', async () => {
    vi.mocked(fg.glob).mockResolvedValue([
      '/root/apps/app1',
      '/root/apps/app2',
    ]);

    const appDirectories = await loadAppDirectories('/root');

    expect(fg.convertPathToPattern).toHaveBeenCalledWith('/root/apps');
    expect(fg.glob).toHaveBeenCalledWith('/root/apps/*', {
      onlyDirectories: true,
    });

    expect(appDirectories).toEqual(['/root/apps/app1', '/root/apps/app2']);
  });
});
