import { describe, it, expect, vi } from 'vitest';
import fs from 'fs/promises';
import { glob } from 'tinyglobby';
import { loadAppExamples } from '../../../server/loaders/examples.js';

vi.mock('fs/promises');
vi.mock('tinyglobby', () => ({
  glob: vi.fn(),
  convertPathToPattern: vi.fn((path) => path),
}));

describe('loadAppExamples', () => {
  it('should use correct glob pattern', async () => {
    vi.mocked(glob).mockResolvedValue([]);

    await loadAppExamples('/app');

    expect(glob).toHaveBeenCalledWith('/app/examples/*.json', {
      onlyFiles: true,
      absolute: true,
      expandDirectories: false,
    });
  });

  it('should load and parse example files', async () => {
    vi.mocked(glob).mockResolvedValue([
      '/app/examples/basic.json',
      '/app/examples/advanced.json',
    ]);

    vi.mocked(fs.readFile)
      .mockResolvedValueOnce('{"name": "Basic"}')
      .mockResolvedValueOnce('{"name": "Advanced"}');

    const examples = await loadAppExamples('/app');

    expect(examples).toEqual({
      basic: { name: 'Basic' },
      advanced: { name: 'Advanced' },
    });
  });

  it('should handle empty examples directory', async () => {
    vi.mocked(glob).mockResolvedValue([]);

    const examples = await loadAppExamples('/app');

    expect(examples).toEqual({});
  });
});
