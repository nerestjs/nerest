import { describe, expect, it } from 'vitest';
import {
  escapeMap,
  stringifyForInjectAsRawToScript,
} from '../../server/utils.js';

describe('stringifyForInjectAsRawToScript', () => {
  it('escapes all characters from escapeMap', () => {
    const data: Record<string, unknown> = {};

    for (const char of Object.keys(escapeMap)) {
      data[`value:${char}`] = `${char}a${char}b${char}`;
      data[`backslash:${char}`] = `\\${char}`;
    }

    const out = stringifyForInjectAsRawToScript(data);

    for (const char of Object.keys(escapeMap)) {
      expect(out).not.toContain(char);
    }

    expect(JSON.parse(out)).toEqual(data);
  });
});
