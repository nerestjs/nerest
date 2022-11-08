import React from 'react';
import { renderToString } from 'react-dom/server';

export function renderSsrComponent(
  AppComponent: React.ComponentType,
  props: Record<string, unknown> = {}
) {
  return renderToString(<AppComponent {...props} />);
}
