import path from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

export type JSONSchema = any;

// Loads and parses the schema file for a specific app
export async function loadAppSchema(appRoot: string) {
  const schemaPath = path.join(appRoot, 'schema.json');
  if (!existsSync(schemaPath)) return null;

  const fileCache = new Map<string, JSONSchema>();
  const resolvedCache = new Map<string, JSONSchema>();
  const resolvingStack = new Set<string>();

  const root = await readJsonFile(schemaPath, fileCache);
  const resolved = await resolveRefsRecursive(
    root,
    schemaPath,
    fileCache,
    resolvedCache,
    resolvingStack
  );
  return resolved;
}

async function resolveRefsRecursive(
  node: JSONSchema,
  currentFile: string,
  fileCache: Map<string, JSONSchema>,
  resolvedCache: Map<string, JSONSchema>,
  resolvingStack: Set<string>
): Promise<JSONSchema> {
  if (Array.isArray(node)) {
    const result = [] as any[];
    for (const item of node) {
      result.push(
        await resolveRefsRecursive(
          item,
          currentFile,
          fileCache,
          resolvedCache,
          resolvingStack
        )
      );
    }
    return result;
  }

  if (typeof node === 'object') {
    if (typeof node.$ref === 'string') {
      // Replace the whole node with the dereferenced target
      return resolveRef(
        node.$ref,
        currentFile,
        fileCache,
        resolvedCache,
        resolvingStack
      );
    }

    const entries = Object.entries(node);
    const out: Record<string, unknown> = {};
    for (const [key, value] of entries) {
      out[key] = await resolveRefsRecursive(
        value as any,
        currentFile,
        fileCache,
        resolvedCache,
        resolvingStack
      );
    }
    return out;
  }

  return node;
}

async function readJsonFile(
  filePath: string,
  fileCache: Map<string, JSONSchema>
): Promise<JSONSchema> {
  const absolute = path.resolve(filePath);
  if (fileCache.has(absolute)) return fileCache.get(absolute);
  const raw = await readFile(absolute, 'utf-8');
  const json = JSON.parse(raw);
  fileCache.set(absolute, json);
  return json;
}

async function resolveRef(
  refValue: string,
  currentFile: string,
  fileCache: Map<string, JSONSchema>,
  resolvedCache: Map<string, JSONSchema>,
  resolvingStack: Set<string>
): Promise<JSONSchema> {
  const [refPathPart, refFragment = ''] = refValue.split('#');

  const targetFile = refPathPart
    ? path.resolve(path.dirname(currentFile), refPathPart)
    : currentFile;

  const cacheKey = `${targetFile}#${refFragment}`;
  if (resolvedCache.has(cacheKey)) {
    return structuredClone(resolvedCache.get(cacheKey));
  }

  if (resolvingStack.has(cacheKey)) {
    throw new Error(`Circular $ref detected at ${cacheKey}`);
  }
  resolvingStack.add(cacheKey);

  const targetDoc = await readJsonFile(targetFile, fileCache);
  const targetNode = refFragment
    ? getByJsonPointer(targetDoc, `#${refFragment}`)
    : targetDoc;
  if (targetNode === undefined) {
    throw new Error(`$ref not found: ${cacheKey}`);
  }

  const resolved = await resolveRefsRecursive(
    structuredClone(targetNode),
    targetFile,
    fileCache,
    resolvedCache,
    resolvingStack
  );
  resolvedCache.set(cacheKey, structuredClone(resolved));
  resolvingStack.delete(cacheKey);
  return structuredClone(resolved);
}

function getByJsonPointer(
  documentRoot: JSONSchema,
  pointer: string
): JSONSchema {
  if (!pointer || pointer === '#') return documentRoot;
  if (!pointer.startsWith('#/')) {
    // Not a JSON Pointer fragment — treat as empty pointer
    return documentRoot;
  }

  const tokens = pointer.slice(2).split('/').map(decodeJsonPointerToken);

  let current: any = documentRoot;
  for (const token of tokens) {
    if (current == null) return undefined;
    current = current[token];
  }
  return current;
}

// To reference keys with special characters, ~1 and ~0 are used
// to escape the / and ~ characters
// https://datatracker.ietf.org/doc/html/rfc6901#section-3
function decodeJsonPointerToken(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}
