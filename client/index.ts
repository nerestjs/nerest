// Shared client entrypoint that bootstraps all of the apps supplied
// by current microfrontend
import React from 'react';
import type { ComponentType } from 'react';
import ReactDOM from 'react-dom/client';

// Since this is a shared entrypoint, it dynamically imports all of the
// available apps. They will be built as separate chunks and only loaded
// if needed.
const modules = import.meta.glob('/apps/*/index.tsx', { import: 'default' });

async function runHydration() {
  for (const container of document.querySelectorAll(
    `div[data-project-name="${import.meta.env.NEREST_PROJECT_NAME}"]`
  )) {
    const appName = container.getAttribute(`data-app-name`);
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

    const reactElement = React.createElement(
      (await appModuleLoader()) as ComponentType,
      props
    );
    ReactDOM.hydrateRoot(container, reactElement);
  }
}

// Apps can only be hydrated after DOM is ready, because we need to query
// apps' containers and their corresponding scripts.
if (document.readyState !== 'complete') {
  document.addEventListener('DOMContentLoaded', runHydration);
} else {
  runHydration();
}

// Entries might be self-initializing (e.g. client-only apps) or have other
// side effects. In that case we have to load them eagerly, so that their
// initialization code can run, even if there is nothing to hydrate.
const clientSideEffects: string[] | undefined = JSON.parse(
  import.meta.env.NEREST_CLIENT_SIDE_EFFECTS
);
clientSideEffects?.forEach((name) => modules[`/apps/${name}/index.tsx`]?.());
