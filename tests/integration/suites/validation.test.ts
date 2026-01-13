import { describe, it, expect } from 'vitest';
import { BASE_URL } from '../constants.js';

describe('Schema validation', () => {
  it('should reject request with missing required field', async () => {
    const response = await fetch(`${BASE_URL}/api/header`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toContain('application/json');

    const error = await response.json();
    expect(error.statusCode).toBe(400);
    expect(error.error).toBe('Bad Request');
    expect(error.message).toContain('countdownSeconds');
  });

  it('should reject request with wrong field type', async () => {
    const response = await fetch(`${BASE_URL}/api/header`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        countdownSeconds: 'not a number',
      }),
    });

    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toContain('application/json');

    const error = await response.json();
    expect(error.statusCode).toBe(400);
    expect(error.error).toBe('Bad Request');
    expect(error.message).toContain('countdownSeconds');
    expect(error.message).toContain('number');
  });
});
