// Shared client entrypoint that bootstraps all of the apps supplied
// by current microfrontend
import React from 'react';
import ReactDOM from 'react-dom/client';

// Since this is a shared entrypoint, it dynamically imports all of the
// available apps. They will be built as separate chunks and only loaded
// if needed.
const modules = import.meta.glob('/apps/*/index.tsx', { import: 'default' });

async function runHydration() {
  for (const container of document.querySelectorAll('div[data-app-name]')) {
    const appName = container.getAttribute('data-app-name');
    const appModuleLoader = modules[`/apps/${appName}/index.tsx`];

    if (!appModuleLoader || container.hasAttribute('data-app-hydrated')) {
      continue;
    }

    // Mark container as hydrated, in case there are multiple instances
    // of the same microfrontend script on the page
    container.setAttribute('data-app-hydrated', 'true');

    const appId = container.getAttribute('data-app-id');
    const propsContainer = document.querySelector(
      `script[data-app-id="${appId}"]`
    );
    // TODO: more robust error handling and error logging
    const props = JSON.parse(propsContainer?.textContent ?? '{}');

    const reactElement = React.createElement(await appModuleLoader(), props);
    ReactDOM.hydrateRoot(container, reactElement);
  }
}

if (document.readyState !== 'complete') {
  document.addEventListener('DOMContentLoaded', runHydration);
} else {
  runHydration();
}
