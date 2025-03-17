import { describe, it, expect, vi } from 'vitest';
import fg from 'fast-glob';
import type { Manifest } from 'vite';
import { loadApps } from '../../../server/loaders/apps.js';
import { loadViteManifest } from '../../../server/loaders/manifest.js';
import { loadAppAssets } from '../../../server/loaders/assets.js';
import { loadAppExamples } from '../../../server/loaders/examples.js';
import { loadAppSchema } from '../../../server/loaders/schema.js';

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

describe('loadApps', () => {
  it('should load apps from directories', async () => {
    const mockManifest: Manifest = {
      'app.tsx': { file: 'app.js', css: [], imports: [] },
    };
    const mockAssets = ['/static/app.js'];
    const mockExamples = { basic: { props: {} } };
    const mockSchema = null;

    vi.mocked(loadViteManifest).mockResolvedValue(mockManifest);
    vi.mocked(fg.glob).mockResolvedValue([
      '/root/apps/app1',
      '/root/apps/app2',
    ]);
    vi.mocked(loadAppAssets).mockReturnValue(mockAssets);
    vi.mocked(loadAppExamples).mockResolvedValue(mockExamples);
    vi.mocked(loadAppSchema).mockResolvedValue(mockSchema);

    const apps = await loadApps('/root', 'http://localhost:3000/');

    expect(fg.convertPathToPattern).toHaveBeenCalledWith('/root/apps');
    expect(fg.glob).toHaveBeenCalledWith('/root/apps/*', {
      onlyDirectories: true,
    });

    expect(loadAppAssets).toHaveBeenCalledWith(
      'app1',
      mockManifest,
      'http://localhost:3000/'
    );
    expect(loadAppAssets).toHaveBeenCalledWith(
      'app2',
      mockManifest,
      'http://localhost:3000/'
    );

    expect(apps).toEqual({
      app1: {
        name: 'app1',
        root: '/root/apps/app1',
        entry: '/root/apps/app1/index.tsx',
        propsHookEntry: '/root/apps/app1/props.ts',
        assets: mockAssets,
        examples: mockExamples,
        schema: mockSchema,
      },
      app2: {
        name: 'app2',
        root: '/root/apps/app2',
        entry: '/root/apps/app2/index.tsx',
        propsHookEntry: '/root/apps/app2/props.ts',
        assets: mockAssets,
        examples: mockExamples,
        schema: mockSchema,
      },
    });
  });
});
