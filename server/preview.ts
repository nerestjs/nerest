// Renders the preview page available by convention at /api/{name}/examples/{example}
export function renderPreviewPage(html: string, assets: string[]) {
  const { scripts, styles } = mapAssets(assets);
  return `
  <html>
  <head>
    ${styles.join('\n')}
  </head>
  <body>
    ${html}
    ${scripts.join('\n')}
  </body>
  </html>
  `;
}

function mapAssets(assets: string[]) {
  // TODO: script type="module" is not supported by older browsers
  // but vite doesn't provide `nomodule` fallback by default
  // see @vitejs/plugin-legacy
  const scripts = assets
    .filter((src) => src.endsWith('.js'))
    .map((src) => `<script type="module" src="${src}"></script>`);

  const styles = assets
    .filter((src) => src.endsWith('.css'))
    .map((src) => `<link rel="stylesheet" href="${src}">`);

  return { scripts, styles };
}
