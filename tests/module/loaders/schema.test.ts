import { describe, it, expect, vi } from 'vitest';
import { existsSync } from 'fs';
import RefParser from '@apidevtools/json-schema-ref-parser';
import { loadAppSchema } from '../../../server/loaders/schema.js';

vi.mock('fs');
vi.mock('@apidevtools/json-schema-ref-parser');

describe('loadAppSchema', () => {
  it('should load and dereference schema when file exists', async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(RefParser.dereference).mockResolvedValue({
      type: 'object',
    } as any);

    const schema = await loadAppSchema('/app');

    expect(existsSync).toHaveBeenCalledWith('/app/schema.json');
    expect(RefParser.dereference).toHaveBeenCalledWith('/app/schema.json', {
      dereference: { circular: false },
    });
    expect(schema).toEqual({ type: 'object' });
  });

  it('should return null when schema file does not exist', async () => {
    vi.mocked(existsSync).mockReturnValue(false);

    const schema = await loadAppSchema('/app');

    expect(existsSync).toHaveBeenCalledWith('/app/schema.json');
    expect(RefParser.dereference).not.toHaveBeenCalled();
    expect(schema).toBeNull();
  });
});
