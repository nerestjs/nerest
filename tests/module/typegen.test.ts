import { describe, it, expect, vi } from 'vitest';
import { compileFromFile } from 'json-schema-to-typescript';
import { glob } from 'tinyglobby';
import fs from 'fs/promises';
import { typegen } from '../../bin/typegen.js';

vi.mock('json-schema-to-typescript');
vi.mock('tinyglobby');
vi.mock('fs/promises');

describe('bin/typegen', () => {
  it('should use default glob pattern when no globs provided', async () => {
    vi.mocked(glob).mockResolvedValue(['apps/test-app/schema.json']);

    await typegen([]);

    expect(glob).toHaveBeenCalledWith(['apps/*/schema.json'], {
      onlyFiles: true,
      expandDirectories: false,
    });
  });

  it('should use provided glob patterns', async () => {
    vi.mocked(glob).mockResolvedValue(['custom/path/schema.json']);

    await typegen(['custom/*/schema.json']);

    expect(glob).toHaveBeenCalledWith(['custom/*/schema.json'], {
      onlyFiles: true,
      expandDirectories: false,
    });
  });

  it('should generate type definitions for each schema', async () => {
    const schemas = ['apps/app1/schema.json', 'apps/app2/schema.json'];
    const mockCompiledSchema = 'type App = { prop: string };';
    vi.mocked(glob).mockResolvedValue(schemas);
    vi.mocked(compileFromFile).mockResolvedValue(mockCompiledSchema);

    await typegen([]);

    expect(compileFromFile).toHaveBeenCalledWith('apps/app1/schema.json', {
      cwd: expect.any(String),
      bannerComment: expect.stringContaining('automatically generated'),
    });
    expect(compileFromFile).toHaveBeenCalledWith('apps/app2/schema.json', {
      cwd: expect.any(String),
      bannerComment: expect.stringContaining('automatically generated'),
    });

    expect(fs.writeFile).toHaveBeenCalledWith(
      'apps/app1/schema.d.ts',
      mockCompiledSchema,
      'utf-8'
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      'apps/app2/schema.d.ts',
      mockCompiledSchema,
      'utf-8'
    );
  });

  it('should handle empty schema list', async () => {
    vi.mocked(glob).mockResolvedValue([]);

    await typegen([]);

    expect(compileFromFile).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should preserve directory structure in output paths', async () => {
    vi.mocked(glob).mockResolvedValue(['nested/deep/path/schema.json']);

    await typegen(['nested/**/*.json']);

    expect(fs.writeFile).toHaveBeenCalledWith(
      'nested/deep/path/schema.d.ts',
      expect.any(String),
      'utf-8'
    );
  });
});
