// https://vite.dev/config/shared-options.html#customlogger
import { createLogger } from 'vite';

const logger = createLogger();

const loggerError = logger.error;
logger.error = (msg, options) => {
  if (typeof msg === 'string' && !isIgnoredError(msg)) {
    loggerError(msg, options);
  }
};

export default logger;

// These are errors expected in development that we don't need to log.
// If the error message includes all markers from a set, it is suppressed
const ignoredErrors = [
  // Hook files are optional, but in development vite logs an error even though
  // we suppress the exception. Silence these logs manually.
  ['cannot find entry point module', 'props.ts'],
  ['cannot find entry point module', 'runtime.ts'],
];

function isIgnoredError(msg: string) {
  for (const markers of ignoredErrors) {
    if (markers.every((m) => msg.includes(m))) {
      return true;
    }
  }
}
