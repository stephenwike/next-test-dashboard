import fs from 'fs/promises';
import path from 'path';

export async function updatePageState({
  pagePath,
  category,
  value,
  rootDir
}: {
  pagePath: string;
  category: string;
  value: string;
  rootDir: string;
}) {
  const filePath = path.join(rootDir, 'pageStates.json');

  const raw = await fs.readFile(filePath, 'utf-8').catch(() => '{}');
  const data = JSON.parse(raw);

  if (!data[pagePath]) {
    data[pagePath] = {};
  }

  data[pagePath][category] = value;

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}
