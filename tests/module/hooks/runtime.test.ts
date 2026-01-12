import { describe, it, expect, vi } from 'vitest';
import { runRuntimeHook } from '../../../server/hooks/runtime.js';

describe('runRuntimeHook', () => {
  const mockLogger = {
    log: {
      fatal: vi.fn(),
      info: vi.fn(),
    },
  } as any;
  const mockLoader = vi.fn();
  const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('process.exit called');
  });

  it('should execute the default function if the module exports a default function', async () => {
    const defaultFunction = vi.fn();
    mockLoader.mockResolvedValue({ default: defaultFunction });

    await runRuntimeHook(mockLogger, mockLoader);

    expect(defaultFunction).toHaveBeenCalledWith(mockLogger);
  });

  it('should log a fatal error and exit if the module does not export a default function', async () => {
    mockLoader.mockResolvedValue({});

    await expect(runRuntimeHook(mockLogger, mockLoader)).rejects.toThrowError(
      'process.exit called'
    );

    expect(mockLogger.log.fatal).toHaveBeenCalledWith(
      "Runtime hook found, but doesn't export default function!"
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should log a fatal error and exit if the module throws an error', async () => {
    const error = new Error('Error in runtime.ts');
    mockLoader.mockResolvedValue({
      default: () => {
        throw error;
      },
    });

    await expect(runRuntimeHook(mockLogger, mockLoader)).rejects.toThrowError(
      'process.exit called'
    );

    expect(mockLogger.log.fatal).toHaveBeenCalledWith(
      error,
      'Failed to execute runtime hook'
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should log an info message if the module does not exist', async () => {
    mockLoader.mockResolvedValue(undefined);

    await runRuntimeHook(mockLogger, mockLoader);

    expect(mockLogger.log.info).toHaveBeenCalledWith(
      'Runtime hook not found, skipping...'
    );
  });
});
