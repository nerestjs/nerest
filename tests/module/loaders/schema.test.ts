import { describe, it, expect } from 'vitest';
import path from 'path';
import os from 'os';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { loadAppSchema } from '../../../server/loaders/schema.js';

describe('loadAppSchema', () => {
  it('should load and return resolved schema when file exists', async () => {
    const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'nerest-schema-'));
    const appRoot = path.join(tmpRoot, 'apps', 'simple');

    try {
      mkdirSync(appRoot, { recursive: true });

      writeFileSync(
        path.join(appRoot, 'schema.json'),
        JSON.stringify({
          type: 'object',
          properties: { a: { type: 'string' } },
          additionalProperties: false,
        })
      );

      const schema = await loadAppSchema(appRoot);

      expect(schema).toEqual({
        type: 'object',
        properties: { a: { type: 'string' } },
        additionalProperties: false,
      });
    } finally {
      rmSync(tmpRoot, { recursive: true, force: true });
    }
  });

  it('should return null when schema file does not exist', async () => {
    const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'nerest-schema-'));
    const appRoot = path.join(tmpRoot, 'apps', 'no-schema');

    try {
      mkdirSync(appRoot, { recursive: true });

      const schema = await loadAppSchema(appRoot);
      expect(schema).toBeNull();
    } finally {
      rmSync(tmpRoot, { recursive: true, force: true });
    }
  });

  it('resolves $ref between multiple files and returns a fully dereferenced schema', async () => {
    const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'nerest-schema-'));
    const appRoot = path.join(tmpRoot, 'apps', 'user');
    const defsDir = path.join(appRoot, 'defs');

    try {
      mkdirSync(defsDir, { recursive: true });

      // defs/address.json
      writeFileSync(
        path.join(defsDir, 'address.json'),
        JSON.stringify({
          type: 'object',
          properties: {
            city: { type: 'string' },
          },
          required: ['city'],
          additionalProperties: false,
        })
      );

      // defs/user.json
      writeFileSync(
        path.join(defsDir, 'user.json'),
        JSON.stringify({
          type: 'object',
          properties: {
            name: { type: 'string' },
            address: { $ref: './address.json' },
          },
          required: ['name', 'address'],
          additionalProperties: false,
        })
      );

      // schema.json
      writeFileSync(
        path.join(appRoot, 'schema.json'),
        JSON.stringify({
          type: 'object',
          properties: {
            user: { $ref: './defs/user.json' },
            address: { $ref: './defs/address.json' },
          },
          required: ['user'],
          additionalProperties: false,
        })
      );

      const schema: any = await loadAppSchema(appRoot);

      // Should be fully dereferenced (no "$ref" keys anywhere)
      expect(JSON.stringify(schema)).not.toContain('"$ref"');

      // Validate nested structure has been inlined
      expect(schema.type).toBe('object');

      // Verify address is dereferenced
      expect(schema.properties.address.type).toBe('object');
      expect(schema.properties.address.properties.city.type).toBe('string');

      // Verify user and user address are dereferenced
      expect(schema.properties.user.type).toBe('object');
      expect(schema.properties.user.properties.name.type).toBe('string');
      expect(schema.properties.user.properties.address.type).toBe('object');
      expect(
        schema.properties.user.properties.address.properties.city.type
      ).toBe('string');
    } finally {
      rmSync(tmpRoot, { recursive: true, force: true });
    }
  });

  it('resolves relative JSON Pointer $refs within the same file', async () => {
    const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'nerest-schema-'));
    const appRoot = path.join(tmpRoot, 'apps', 'pointer');

    try {
      mkdirSync(appRoot, { recursive: true });

      writeFileSync(
        path.join(appRoot, 'schema.json'),
        JSON.stringify({
          definitions: {
            address: {
              type: 'object',
              properties: { city: { type: 'string' } },
              required: ['city'],
              additionalProperties: false,
            },
            user: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { $ref: '#/definitions/address' },
              },
              required: ['name', 'address'],
              additionalProperties: false,
            },
          },
          type: 'object',
          properties: {
            mainUser: { $ref: '#/definitions/user' },
          },
          required: ['mainUser'],
          additionalProperties: false,
        })
      );

      const schema: any = await loadAppSchema(appRoot);

      // No $ref should remain
      expect(JSON.stringify(schema)).not.toContain('"$ref"');

      // Validate structure has been inlined from definitions
      expect(schema.type).toBe('object');
      expect(schema.properties.mainUser.type).toBe('object');
      expect(schema.properties.mainUser.properties.name.type).toBe('string');
      expect(schema.properties.mainUser.properties.address.type).toBe('object');
      expect(
        schema.properties.mainUser.properties.address.properties.city.type
      ).toBe('string');
    } finally {
      rmSync(tmpRoot, { recursive: true, force: true });
    }
  });
});
