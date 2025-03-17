import { describe, it, expect } from 'vitest';
import { renderPreviewPage } from '../../../server/parts/preview.js';

describe('renderPreviewPage', () => {
  it('should render a complete HTML page with provided content', () => {
    const result = renderPreviewPage(
      '<div>Test content</div>',
      ['/assets/main.js', '/assets/style.css', '/assets/extra.js'],
      {
        head: '<title>Test Page</title>',
      }
    );

    expect(result).toMatchSnapshot();
  });

  it('should order CSS before JS in the document', () => {
    const result = renderPreviewPage(
      '<div>Content</div>',
      ['/assets/script.js', '/assets/style.css'],
      {
        head: '',
      }
    );

    // Convert to single line to make index comparison easier
    const singleLineResult = result.replace(/\n\s*/g, '');

    const cssIndex = singleLineResult.indexOf('/assets/style.css');
    const jsIndex = singleLineResult.indexOf('/assets/script.js');

    expect(cssIndex).toBeLessThan(jsIndex);
  });
});
