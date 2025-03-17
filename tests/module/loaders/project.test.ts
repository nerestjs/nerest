import { describe, it, expect, vi } from 'vitest';
import fs from 'fs/promises';
import { loadProject } from '../../../server/loaders/project.js';

vi.mock('fs/promises');

describe('loadProject', () => {
  it('should load project info from package.json', async () => {
    const mockPackage = {
      name: 'test-app',
      description: 'Test Description',
      version: '1.0.0',
      homepage: 'https://example.com',
      repository: 'github:org/repo',
    };
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackage));

    const project = await loadProject('/root');

    expect(fs.readFile).toHaveBeenCalledWith('/root/package.json', 'utf-8');
    expect(project).toEqual(mockPackage);
  });

  it('should warn when name is missing', async () => {
    const mockPackage = {
      description: 'Test Description',
    };
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackage));
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const project = await loadProject('/root');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"name" is not set in package.json')
    );
    expect(project.name).toBe('');
  });
});
