import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderApp } from '../../../server/parts/render.js';

vi.mock('../../../server/utils.js', () => ({
  randomId: () => 'test-id-123',
}));

describe('renderApp', () => {
  function TestComponent() {
    return createElement('div', null, 'Hello World');
  }
  const mockProject = { name: 'test-project' };

  it('should return html and assets', () => {
    const assets = ['/main.js', '/style.css'];
    const result = renderApp({
      name: 'test-app',
      assets,
      component: TestComponent,
      project: mockProject,
    });

    expect(result).toEqual({
      html: expect.any(String),
      assets,
    });
  });

  it('should render component with correct attributes', () => {
    const { html } = renderApp({
      name: 'test-app',
      assets: [],
      component: TestComponent,
      project: mockProject,
    });

    expect(html).toContain('data-project-name="test-project"');
    expect(html).toContain('data-app-name="test-app"');
    expect(html).toContain('data-app-id="test-id-123"');
  });

  it('should include serialized props in script tag with matching app id', () => {
    const customProps = { message: 'Custom Message' };
    const { html } = renderApp(
      {
        name: 'test-app',
        assets: [],
        component: TestComponent,
        project: mockProject,
      },
      customProps
    );

    const expectedScript = `<script type="application/json" data-app-id="test-id-123">${JSON.stringify(customProps)}</script>`;
    expect(html).toContain(expectedScript);
  });

  it('should render component content', () => {
    const { html } = renderApp({
      name: 'test-app',
      assets: [],
      component: TestComponent,
      project: mockProject,
    });

    expect(html).toContain('Hello World');
  });
});
