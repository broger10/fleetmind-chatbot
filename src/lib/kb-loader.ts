import { readFileSync } from 'fs';
import path from 'path';

export function loadKB(filename: string): string {
  const filePath = path.join(process.cwd(), 'src', 'knowledge-base', filename);
  return readFileSync(filePath, 'utf-8');
}
