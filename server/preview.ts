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
  const scripts = assets
    .filter((src) => src.endsWith('.js'))
    .map((src) => `<script type="module" src="${src}"></script>`);

  const styles = assets
    .filter((src) => src.endsWith('.css'))
    .map((src) => `<link rel="stylesheet" href="${src}">`);

  return { scripts, styles };
}
