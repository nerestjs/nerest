import { describe, it, expect, vi } from 'vitest';
import { runPropsHook } from '../../../server/hooks/props.js';

describe('runPropsHook', () => {
  const mockLogger = { log: {} } as any;
  const mockLoader = vi.fn();

  it('should return modified props if module exports a default function', async () => {
    const originalProps = { key: 'value' };
    const modifiedProps = { key: 'modifiedValue' };
    const mockLoaderDefault = vi.fn(() => modifiedProps);
    mockLoader.mockResolvedValue({ default: mockLoaderDefault });

    const result = await runPropsHook(mockLogger, mockLoader, originalProps);

    expect(mockLoaderDefault).toHaveBeenCalledWith(
      originalProps,
      mockLogger.log
    );
    expect(result).toBe(modifiedProps);
  });

  it('should return original props if the module does not export a default function', async () => {
    const originalProps = { key: 'value' };
    mockLoader.mockResolvedValue({});

    const result = await runPropsHook(mockLogger, mockLoader, originalProps);

    expect(result).toBe(originalProps);
  });

  it('should return original props if the module loader throws an error', async () => {
    const originalProps = { key: 'value' };
    mockLoader.mockRejectedValue(new Error('Module not found'));

    const result = await runPropsHook(mockLogger, mockLoader, originalProps);

    expect(result).toBe(originalProps);
  });

  it('should throw an error if default function throws an error', async () => {
    const originalProps = { key: 'value' };
    const error = new Error('Props error');
    mockLoader.mockResolvedValue({
      default: () => {
        throw error;
      },
    });

    await expect(
      runPropsHook(mockLogger, mockLoader, originalProps)
    ).rejects.toThrow(error);
  });
});
