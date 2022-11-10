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
  const appId = nanoid();

  const container = `<div data-app-name="${appName}" data-app-id="${appId}">${html}</div>`;
  const script = `<script type="application/json" data-app-id="${appId}">${JSON.stringify(
    props
  )}</script>`;

  return container + script;
}
