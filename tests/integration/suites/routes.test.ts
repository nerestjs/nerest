import { describe, it, expect } from 'vitest';
import { BASE_URL } from '../utils.js';

describe('Routes', () => {
  it('should render header app via POST request', async () => {
    const response = await fetch(`${BASE_URL}/api/header`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ countdownSeconds: 10 }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');

    const result = await response.json();

    // Check response structure
    expect(result.html).toBeDefined();
    expect(result.assets).toBeInstanceOf(Array);

    // Check HTML content
    expect(result.html).toContain(
      'data-project-name="nerest-integration-harness"'
    );
    expect(result.html).toContain('data-app-name="header"');
    expect(result.html).toContain('<header');
    expect(result.html).toContain('<script type="application/json"');

    // Check assets
    expect(result.assets.some((asset) => asset.endsWith('.js'))).toBe(true);
  });

  it('should render header example page via GET request', async () => {
    const response = await fetch(`${BASE_URL}/api/header/examples/five`);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');

    const html = await response.text();

    // Check if it's a complete HTML document
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');

    // Check for app-specific content
    expect(html).toContain('data-project-name="nerest-integration-harness"');
    expect(html).toContain('data-app-name="header"');
    expect(html).toContain('<header');

    // Check for required assets
    expect(html).toContain(
      '<link rel="stylesheet" href="http://127.0.0.1:3000/index.css">'
    );
    expect(html).toContain(
      '<script type="module" src="http://127.0.0.1:3000/index.js"></script>'
    );
  });

  it.each(['/livenessProbe', '/readinessProbe'])(
    'should serve %s route',
    async (route) => {
      const response = await fetch(`${BASE_URL}${route}`);
      expect(response.status).toBe(200);
    }
  );
});
