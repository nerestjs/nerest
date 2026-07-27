import { describe, it, expect } from 'vitest';
import { BASE_URL } from '../constants.js';

describe('Preload hook', () => {
  it('imports the preload module and runs its startup handler', async () => {
    const response = await fetch(`${BASE_URL}/preload-status`);

    expect(response.status).toBe(200);

    const status = await response.json();

    // The preload module's top-level code ran...
    expect(status.imported).toBe(true);
    // ...and its startup handler was invoked during server start.
    expect(status.startup).toBe(true);
  });
});
