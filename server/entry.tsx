import React from 'react';
import { renderToString } from 'react-dom/server';
import { nanoid } from 'nanoid';

export function renderSsrComponent(
  appName: string,
  AppComponent: React.ComponentType,
  props: Record<string, unknown> = {}
) {
  const html = renderToString(<AppComponent {...props} />);
  const appId = nanoid();

  const container = `<div data-app-name="${appName}" data-app-id="${appId}">${html}</div>`;
  const script = `<script type="application/json" data-app-id="${appId}">${JSON.stringify(
    props
  )}</script>`;

  return container + script;
}
