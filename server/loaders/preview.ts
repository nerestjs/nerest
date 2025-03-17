import path from 'path';
import { existsSync } from 'fs';
import fs from 'fs/promises';

export type PreviewParts = {
  head: string;
};

export async function loadPreviewParts(root: string): Promise<PreviewParts> {
  let head = '';
  const headPath = path.join(root, 'nerest/preview-head.html');
  if (existsSync(headPath)) {
    head = await fs.readFile(headPath, 'utf-8');
  }

  return { head };
}
