import { describe, it, expect, vi } from 'vitest';
import { runLoggerHook } from '../../../server/hooks/logger.js';

describe('runLoggerHook', () => {
  const mockLoader = vi.fn();
  const mockConsoleError = vi
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('process.exit called');
  });

  it('should return logger configuration if module exports a logger function', async () => {
    const loggerConfig = { level: 'info' };
    mockLoader.mockResolvedValue({ logger: () => loggerConfig });

    const result = await runLoggerHook(mockLoader);

    expect(result).toBe(loggerConfig);
  });

  it('should return null if module does not export a logger function', async () => {
    mockLoader.mockResolvedValue({});

    const result = await runLoggerHook(mockLoader);

    expect(result).toBeNull();
  });

  it('should return null if module loader throws an error', async () => {
    mockLoader.mockRejectedValue(new Error('Module not found'));

    const result = await runLoggerHook(mockLoader);

    expect(result).toBeNull();
  });

  it('should log the error and exit process if logger function throws an error', async () => {
    const error = new Error('Logger error');
    mockLoader.mockResolvedValue({
      logger: () => {
        throw error;
      },
    });

    await expect(runLoggerHook(mockLoader)).rejects.toThrowError(
      'process.exit called'
    );

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Failed to load logger configuration',
      error
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });
});
