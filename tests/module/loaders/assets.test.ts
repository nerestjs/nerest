import { describe, it, expect } from 'vitest';
import type { Manifest } from 'vite';
import { loadAppAssets } from '../../../server/loaders/assets.js';

describe('loadAppAssets', () => {
  it('should include client entry and app CSS', () => {
    const mockManifest: Manifest = {
      'node_modules/@nerest/nerest/client/index.ts': {
        file: 'assets/client.js',
      },
      'apps/test-app/index.tsx': {
        file: 'assets/test-app.js',
        css: ['assets/test-app.css'],
        imports: ['chunk1'],
      },
      chunk1: {
        file: 'assets/chunk1.js',
        css: ['assets/chunk1.css'],
        imports: ['chunk2'],
      },
      chunk2: {
        file: 'assets/chunk2.js',
        css: ['assets/chunk2.css'],
      },
    };

    const assets = loadAppAssets(
      'test-app',
      mockManifest,
      'http://localhost:3000/'
    );

    expect(assets).toEqual([
      'http://localhost:3000/assets/client.js',
      'http://localhost:3000/assets/test-app.css',
      'http://localhost:3000/assets/chunk1.css',
      'http://localhost:3000/assets/chunk2.css',
    ]);
  });

  it('should handle app without CSS', () => {
    const manifestWithoutCss: Manifest = {
      'node_modules/@nerest/nerest/client/index.ts': {
        file: 'assets/client.js',
      },
      'apps/test-app/index.tsx': {
        file: 'assets/test-app.js',
      },
    };

    const assets = loadAppAssets(
      'test-app',
      manifestWithoutCss,
      'http://localhost:3000/'
    );

    expect(assets).toEqual(['http://localhost:3000/assets/client.js']);
  });

  it('should handle app with circular imports', () => {
    const circularManifest: Manifest = {
      'node_modules/@nerest/nerest/client/index.ts': {
        file: 'assets/client.js',
      },
      'apps/test-app/index.tsx': {
        file: 'assets/test-app.js',
        css: ['assets/test-app.css'],
        imports: ['chunk1'],
      },
      chunk1: {
        file: 'assets/chunk1.js',
        css: ['assets/chunk1.css'],
        imports: ['chunk2'],
      },
      chunk2: {
        file: 'assets/chunk2.js',
        css: ['assets/chunk2.css'],
        imports: ['chunk1'], // Circular import
      },
    };

    const assets = loadAppAssets(
      'test-app',
      circularManifest,
      'http://localhost:3000/'
    );

    expect(assets).toEqual([
      'http://localhost:3000/assets/client.js',
      'http://localhost:3000/assets/test-app.css',
      'http://localhost:3000/assets/chunk1.css',
      'http://localhost:3000/assets/chunk2.css',
    ]);
  });
});
