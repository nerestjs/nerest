import type { ComponentType } from 'react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import type { Project } from '../loaders/project.js';
import { randomId } from '../utils.js';

type RenderProps = {
  name: string;
  assets: string[];
  component: ComponentType;
  project: Project;
};

export function renderApp(
  { name, assets, component, project }: RenderProps,
  props: Record<string, unknown> = {}
) {
  const html = renderSsrComponent(name, component, project, props);
  return { html, assets };
}

function renderSsrComponent(
  appName: string,
  appComponent: ComponentType,
  project: Project,
  props: Record<string, unknown>
) {
  const html = renderToString(createElement(appComponent, props));

  // There may be multiple instances of the same app on the page,
  // so we will use a randomized id to avoid collisions
  const appId = randomId();

  // data-app-name and data-app-id are used by client entrypoint to hydrate
  // apps using correct serialized props
  const container = `<div data-project-name="${project.name}" data-app-name="${appName}" data-app-id="${appId}">${html}</div>`;
  const script = `<script type="application/json" data-app-id="${appId}">${JSON.stringify(
    props
  )}</script>`;

  return container + script;
}
