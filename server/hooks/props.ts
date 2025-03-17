import type { FastifyBaseLogger, FastifyInstance } from 'fastify';

type PropsHookModule = {
  default: (props: unknown, logger: FastifyBaseLogger) => unknown;
};

// Load the props hook module and run it if it exists, passing down app's
// props object and logger. This hook can be used to modify props before
// they are passed to the root app component.
export async function runPropsHook(
  app: FastifyInstance,
  loader: () => Promise<unknown>,
  props: unknown
) {
  let module: PropsHookModule | undefined;

  try {
    module = (await loader()) as PropsHookModule;
  } catch {}

  // If module exists and exports a default function, run it to modify props
  return (
    typeof module?.default === 'function'
      ? module.default(props, app.log)
      : props
  ) as Record<string, unknown>;
}
