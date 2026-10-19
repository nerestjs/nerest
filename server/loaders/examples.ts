import path from 'path';
import fs from 'fs/promises';
import { convertPathToPattern, glob } from 'tinyglobby';

// Loads and parses the example json files for providing
// `/examples/` routes of the dev server
export async function loadAppExamples(appRoot: string) {
  const exampleBase = path.join(appRoot, 'examples');
  const examplePattern = `${convertPathToPattern(exampleBase)}/*.json`;
  const exampleFiles = await glob(examplePattern, {
    onlyFiles: true,
    absolute: true,
    expandDirectories: false,
  });

  const examples: Record<string, unknown> = {};

  // TODO: error handling and reporting
  for (const filePath of exampleFiles) {
    const content = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(content);
    examples[path.basename(filePath, '.json')] = json;
  }

  return examples;
}
