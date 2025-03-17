import { describe, it, expect } from 'vitest';
import { BASE_URL } from '../utils.js';

describe('Swagger UI', () => {
  it('should serve Swagger UI at /api', async () => {
    const response = await fetch(`${BASE_URL}/api`);
    expect(response.status).toBe(200);

    const html = await response.text();

    // Check for key Swagger UI elements in the HTML
    expect(html).toContain('swagger-ui');
    expect(html).toContain('Swagger UI');
  });

  it('should serve valid OpenAPI JSON at /api/json', async () => {
    const response = await fetch(`${BASE_URL}/api/json`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');

    const json = await response.json();

    // Basic OpenAPI schema validation
    expect(json.openapi).toBeDefined();
    expect(json.info).toBeDefined();
    expect(json.paths).toBeDefined();
  });
});
