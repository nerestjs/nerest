import { describe, it, expect, vi } from 'vitest';
import {
  runPreloadStartupHook,
  runPreloadShutdownHook,
} from '../../../server/hooks/preload.js';

describe('preload hooks', () => {
  const mockLogger = {
    fatal: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  } as any;
  const mockLoader = vi.fn();
  const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('process.exit called');
  });

  describe('runPreloadStartupHook', () => {
    it('should execute the startup handler if the module exports one', async () => {
      const startup = vi.fn();
      mockLoader.mockResolvedValue({ startup });

      await runPreloadStartupHook(mockLogger, mockLoader);

      expect(startup).toHaveBeenCalledOnce();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Preload startup hook executed'
      );
    });

    it('should do nothing if the module does not export a startup handler', async () => {
      mockLoader.mockResolvedValue({ shutdown: vi.fn() });

      await runPreloadStartupHook(mockLogger, mockLoader);

      expect(mockLogger.info).not.toHaveBeenCalled();
      expect(mockProcessExit).not.toHaveBeenCalled();
    });

    it('should do nothing if the module does not exist', async () => {
      mockLoader.mockRejectedValue(new Error('not found'));

      await runPreloadStartupHook(mockLogger, mockLoader);

      expect(mockLogger.info).not.toHaveBeenCalled();
      expect(mockProcessExit).not.toHaveBeenCalled();
    });

    it('should log a fatal error and exit if the startup handler throws', async () => {
      const error = new Error('Error in startup');
      mockLoader.mockResolvedValue({
        startup: () => {
          throw error;
        },
      });

      await expect(
        runPreloadStartupHook(mockLogger, mockLoader)
      ).rejects.toThrowError('process.exit called');

      expect(mockLogger.fatal).toHaveBeenCalledWith(
        error,
        'Failed to execute preload startup hook'
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });

  describe('runPreloadShutdownHook', () => {
    it('should execute the shutdown handler if the module exports one', async () => {
      const shutdown = vi.fn();
      mockLoader.mockResolvedValue({ shutdown });

      await runPreloadShutdownHook(mockLogger, mockLoader);

      expect(shutdown).toHaveBeenCalledOnce();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Preload shutdown hook executed'
      );
    });

    it('should do nothing if the module does not export a shutdown handler', async () => {
      mockLoader.mockResolvedValue({ startup: vi.fn() });

      await runPreloadShutdownHook(mockLogger, mockLoader);

      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should log an error but not exit if the shutdown handler throws', async () => {
      const error = new Error('Error in shutdown');
      mockLoader.mockResolvedValue({
        shutdown: () => {
          throw error;
        },
      });

      await runPreloadShutdownHook(mockLogger, mockLoader);

      expect(mockLogger.error).toHaveBeenCalledWith(
        error,
        'Failed to execute preload shutdown hook'
      );
      expect(mockProcessExit).not.toHaveBeenCalled();
    });
  });
});
