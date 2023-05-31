import React from 'react';
import { renderToString } from 'react-dom/server';
import { nanoid } from 'nanoid';

import type { AppEntry } from './apps';

export function renderApp(
  appEntry: AppEntry,
  appComponent: React.ComponentType,
  props: Record<string, unknown> = {}
) {
  const { name, assets } = appEntry;
  const html = renderSsrComponent(name, appComponent, props);
  return { html, assets };
}

function renderSsrComponent(
  appName: string,
  appComponent: React.ComponentType,
  props: Record<string, unknown>
) {
  const html = renderToString(React.createElement(appComponent, props));

  // There may be multiple instances of the same app on the page,
  // so we will use a randomized id to avoid collisions
  const appId = nanoid();

  // data-app-name and data-app-id are used by client entrypoint to hydrate
  // apps using correct serialized props
  const container = `<div data-app-name="${appName}" data-app-id="${appId}">${html}</div>`;
  const script = `<script type="application/json" data-app-id="${appId}">${JSON.stringify(
    props
  )}</script>`;

  return container + script;
}
