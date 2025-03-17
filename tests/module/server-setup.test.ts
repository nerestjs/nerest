import { describe, it, expect, vi, afterAll } from 'vitest';
import fastifyGracefulShutdown from 'fastify-graceful-shutdown';
import { createServer } from '../../server/shared.js';
import type { AppEntry } from '../../server/loaders/apps.js';
import { loadPreviewParts } from '../../server/loaders/preview.js';
import { runLoggerHook } from '../../server/hooks/logger.js';
import { runRuntimeHook } from '../../server/hooks/runtime.js';
import { setupValidator } from '../../server/parts/validator.js';
import { setupSwagger } from '../../server/parts/swagger.js';
import { setupK8SProbes } from '../../server/parts/k8s-probes.js';

vi.mock('fastify', () => ({
  default: vi.fn(() => ({
    register: vi.fn(),
    post: vi.fn(),
    get: vi.fn(),
    log: {
      error: vi.fn(),
    },
  })),
}));

vi.mock('fastify-graceful-shutdown');
vi.mock('../../server/loaders/preview.js');
vi.mock('../../server/hooks/logger.js');
vi.mock('../../server/hooks/runtime.js');
vi.mock('../../server/parts/validator.js');
vi.mock('../../server/parts/swagger.js');
vi.mock('../../server/parts/k8s-probes.js');

describe('server setup', () => {
  const mockProject = {
    name: 'test-project',
    version: '1.0.0',
  };

  const mockApps: Record<string, AppEntry> = {
    'test-app': {
      name: 'test-app',
      root: '/test',
      entry: '/apps/test-app/index.tsx',
      propsHookEntry: '/apps/test-app/props.ts',
      assets: ['/assets/test-app.js'],
      examples: {
        basic: { message: 'Hello' },
        invalid: { wrongProp: 'Invalid' },
      },
      schema: {
        type: 'object',
        description: 'Test app schema',
        properties: {
          message: { type: 'string' },
        },
        required: ['message'],
      },
    },
  };

  const mockLoadComponent = vi.fn();
  const mockLoadPropsHook = vi.fn();
  const mockLoadRuntimeHook = vi.fn();

  it('should create server with correct configuration', async () => {
    const server = await createServer({
      root: '/test',
      project: mockProject,
      apps: mockApps,
      loadComponent: mockLoadComponent,
      loadPropsHook: mockLoadPropsHook,
      loadRuntimeHook: mockLoadRuntimeHook,
    });

    expect(server).toBeDefined();
    expect(runLoggerHook).toHaveBeenCalledWith(mockLoadRuntimeHook);
    expect(setupValidator).toHaveBeenCalledWith(server);
    expect(setupSwagger).toHaveBeenCalledWith(server, mockProject);
    expect(loadPreviewParts).toHaveBeenCalledWith('/test');
    expect(server.register).toHaveBeenCalledWith(fastifyGracefulShutdown);
    expect(runRuntimeHook).toHaveBeenCalledWith(server, mockLoadRuntimeHook);
  });

  it('should setup API routes for each app', async () => {
    const server = await createServer({
      root: '/test',
      project: mockProject,
      apps: mockApps,
      loadComponent: mockLoadComponent,
      loadPropsHook: mockLoadPropsHook,
      loadRuntimeHook: mockLoadRuntimeHook,
    });

    expect(server.post).toHaveBeenCalledWith(
      '/api/test-app',
      {
        schema: {
          summary: 'Test app schema',
          tags: ['test-app'],
          body: {
            ...mockApps['test-app'].schema,
            examples: Object.values(mockApps['test-app'].examples),
          },
        },
      },
      expect.any(Function)
    );
  });

  it('should setup example routes for each app example', async () => {
    const server = await createServer({
      root: '/test',
      project: mockProject,
      apps: mockApps,
      loadComponent: mockLoadComponent,
      loadPropsHook: mockLoadPropsHook,
      loadRuntimeHook: mockLoadRuntimeHook,
    });

    expect(server.get).toHaveBeenCalledWith(
      '/api/test-app/examples/basic',
      expect.any(Object),
      expect.any(Function)
    );
    expect(server.get).toHaveBeenCalledWith(
      '/api/test-app/examples/invalid',
      expect.any(Object),
      expect.any(Function)
    );
  });

  it('should log error for invalid examples', async () => {
    const server = await createServer({
      root: '/test',
      project: mockProject,
      apps: mockApps,
      loadComponent: mockLoadComponent,
      loadPropsHook: mockLoadPropsHook,
      loadRuntimeHook: mockLoadRuntimeHook,
    });

    expect(server.log.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'Example "invalid" of app "test-app" does not satisfy schema'
      )
    );
  });

  describe('K8S probes', () => {
    afterAll(() => {
      vi.unstubAllEnvs();
    });

    it('should setup K8S probes when enabled', async () => {
      vi.stubEnv('ENABLE_K8S_PROBES', 'true');

      const server = await createServer({
        root: '/test',
        project: mockProject,
        apps: mockApps,
        loadComponent: mockLoadComponent,
        loadPropsHook: mockLoadPropsHook,
        loadRuntimeHook: mockLoadRuntimeHook,
      });

      expect(setupK8SProbes).toHaveBeenCalledWith(server);
    });

    it('should not setup K8S probes when disabled', async () => {
      vi.stubEnv('ENABLE_K8S_PROBES', '');

      await createServer({
        root: '/test',
        project: mockProject,
        apps: mockApps,
        loadComponent: mockLoadComponent,
        loadPropsHook: mockLoadPropsHook,
        loadRuntimeHook: mockLoadRuntimeHook,
      });

      expect(setupK8SProbes).not.toHaveBeenCalled();
    });
  });
});
