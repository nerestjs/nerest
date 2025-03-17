import { describe, it, expect, vi } from 'vitest';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { loadPreviewParts } from '../../../server/loaders/preview.js';

vi.mock('fs/promises');
vi.mock('fs');

describe('loadPreviewParts', () => {
  it('should load preview head when file exists', async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(fs.readFile).mockResolvedValue('<title>Preview</title>');

    const parts = await loadPreviewParts('/root');

    expect(existsSync).toHaveBeenCalledWith('/root/nerest/preview-head.html');
    expect(parts).toEqual({ head: '<title>Preview</title>' });
  });

  it('should return empty head when file does not exist', async () => {
    vi.mocked(existsSync).mockReturnValue(false);

    const parts = await loadPreviewParts('/root');

    expect(existsSync).toHaveBeenCalledWith('/root/nerest/preview-head.html');
    expect(fs.readFile).not.toHaveBeenCalled();
    expect(parts).toEqual({ head: '' });
  });
});
