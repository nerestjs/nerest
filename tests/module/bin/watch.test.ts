import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { buildPreloadBundleInChildProcess } from '../../../bin/watch.js';

vi.mock('child_process');

// Stands in for the spawned builder, so tests can drive its exit.
function mockChildProcess() {
  const child = new EventEmitter();
  vi.mocked(spawn).mockReturnValue(child as never);
  return child;
}

describe('buildPreloadBundleInChildProcess', () => {
  beforeEach(() => {
    vi.mocked(spawn).mockReset();
  });

  it('should build the bundle in a separate node process', async () => {
    const child = mockChildProcess();

    const built = buildPreloadBundleInChildProcess('/project', '/');
    child.emit('exit', 0, null);

    await expect(built).resolves.toBeUndefined();
    expect(spawn).toHaveBeenCalledWith(
      process.execPath,
      [expect.stringContaining('preload-cli'), '/project', '/'],
      { stdio: 'inherit' }
    );
  });

  it('should reject when the build exits with a non-zero code', async () => {
    const child = mockChildProcess();

    const built = buildPreloadBundleInChildProcess('/project', '/');
    child.emit('exit', 1, null);

    await expect(built).rejects.toThrow('exit code 1');
  });

  it('should reject when the build is killed by a signal', async () => {
    const child = mockChildProcess();

    const built = buildPreloadBundleInChildProcess('/project', '/');
    child.emit('exit', null, 'SIGKILL');

    await expect(built).rejects.toThrow('signal SIGKILL');
  });

  it('should reject when the process cannot be spawned', async () => {
    const child = mockChildProcess();

    const built = buildPreloadBundleInChildProcess('/project', '/');
    child.emit('error', new Error('ENOENT'));

    await expect(built).rejects.toThrow('ENOENT');
  });
});
