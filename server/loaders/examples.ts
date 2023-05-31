import path from 'path';
import { existsSync } from 'fs';
import fs from 'fs/promises';

// Loads and parses the example json files for providing
// `/examples/` routes of the dev server
export async function loadAppExamples(appRoot: string) {
  const examplesRoot = path.join(appRoot, 'examples');

  // Examples are optional and may not exist
  if (!existsSync(examplesRoot)) {
    return {};
  }

  const exampleFiles = (await fs.readdir(examplesRoot, { withFileTypes: true }))
    .filter((d) => d.isFile() && d.name.endsWith('.json'))
    .map((d) => d.name);

  const examples: Record<string, unknown> = {};

  // TODO: error handling and reporting
  for (const filename of exampleFiles) {
    const file = path.join(examplesRoot, filename);
    const content = await fs.readFile(file, { encoding: 'utf8' });
    const json = JSON.parse(content);
    examples[path.basename(filename, '.json')] = json;
  }

  return examples;
}
