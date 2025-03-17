import type { PreviewParts } from '../loaders/preview.js';

// Renders the preview page available by convention at /api/{name}/examples/{example}
export function renderPreviewPage(
  html: string,
  assets: string[],
  parts: PreviewParts
) {
  const { scripts, styles } = mapAssets(assets);
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${styles.join('\n')}
    ${parts.head}
  </head>
  <body>
    ${html}
    ${scripts.join('\n')}
  </body>
  </html>
  `;
}

function mapAssets(assets: string[]) {
  const scripts = assets
    .filter((src) => src.endsWith('.js'))
    .map((src) => `<script type="module" src="${src}"></script>`);

  const styles = assets
    .filter((src) => src.endsWith('.css'))
    .map((src) => `<link rel="stylesheet" href="${src}">`);

  return { scripts, styles };
}
