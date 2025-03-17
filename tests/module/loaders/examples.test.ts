import { describe, it, expect, vi } from 'vitest';
import fs from 'fs/promises';
import fg from 'fast-glob';
import { loadAppExamples } from '../../../server/loaders/examples.js';

vi.mock('fs/promises');
vi.mock('fast-glob');

describe('loadAppExamples', () => {
  it('should use correct glob pattern', async () => {
    vi.mocked(fg.convertPathToPattern).mockReturnValue('converted/path');
    vi.mocked(fg.glob).mockResolvedValue([]);

    await loadAppExamples('/app');

    expect(fg.convertPathToPattern).toHaveBeenCalledWith('/app/examples');
    expect(fg.glob).toHaveBeenCalledWith('converted/path/*.json', {
      onlyFiles: true,
    });
  });

  it('should load and parse example files', async () => {
    vi.mocked(fg.glob).mockResolvedValue([
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
    vi.mocked(fg.glob).mockResolvedValue([]);

    const examples = await loadAppExamples('/app');

    expect(examples).toEqual({});
  });
});
