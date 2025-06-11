import fs from 'fs/promises';
import path from 'path';
import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Pages',
  description: 'Directory of test pages',
};

// Dynamically import StatusDropdown as a client component
const StatusDropdown = dynamic(() => import('./StatusDropdown'), { ssr: false });

const STATUS_FIELDS = ['design', 'implementation', 'integration'] as const;
type StatusCategory = (typeof STATUS_FIELDS)[number];

const findGroupedPages = async (
  dir: string,
  basePath = '',
  pageStates: Record<string, any>,
  newEntries: Set<string>
): Promise<Record<string, string[]>> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const grouped: Record<string, string[]> = {};

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const pageFile = path.join(entryPath, 'page.tsx');
      try {
        await fs.access(pageFile);

        const cleanPath = relativePath.replace(/\\/g, '/');
        if (!pageStates[cleanPath]) {
          pageStates[cleanPath] = {
            design: 'not-started',
            implementation: 'not-started',
            integration: 'not-started',
          };
          newEntries.add(cleanPath);
        }

        const groupName = basePath.replace(/\\/g, '/').replace(/^\/?/, '') || 'Test Pages';
        grouped[groupName] = grouped[groupName] || [];
        grouped[groupName].push(relativePath);
      } catch {
        // skip
      }

      const subGrouped = await findGroupedPages(entryPath, relativePath, pageStates, newEntries);
      for (const [key, paths] of Object.entries(subGrouped)) {
        grouped[key] = grouped[key] || [];
        grouped[key].push(...paths);
      }
    }
  }

  return grouped;
};

const formatGroupTitle = (group: string) =>
  group
    .split('/')
    .map(word =>
      word
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
    )
    .join(' ');

const TestIndexPage = async () => {
  const testDir = path.join(process.cwd(), 'src', 'app', 'test');
  const pageStateFile = path.join(testDir, 'pageStates.json');

  let pageStates: Record<string, any> = {};
  const newEntries = new Set<string>();

  try {
    const data = await fs.readFile(pageStateFile, 'utf-8');
    pageStates = JSON.parse(data);
  } catch {
    await fs.writeFile(pageStateFile, '{}', 'utf-8');
  }

  const groupedPages = await findGroupedPages(testDir, '', pageStates, newEntries);

  if (newEntries.size > 0) {
    await fs.writeFile(pageStateFile, JSON.stringify(pageStates, null, 2), 'utf-8');
  }

  const sortedGroups = Object.keys(groupedPages).sort();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Test Pages</h1>
      {sortedGroups.map((group) => (
        <div key={group} className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">{formatGroupTitle(group)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedPages[group].map((routePath) => {
              const cleanPath = routePath.replace(/\\/g, '/');
              const state = pageStates[cleanPath] || {};

              return (
                <Link key={cleanPath} href={`/test/${cleanPath}`}>
                  <div className="border rounded-lg p-4 shadow hover:shadow-md hover:bg-gray-100 cursor-pointer">
                    <h3 className="text-md font-semibold break-all mb-1">{cleanPath}</h3>
                    <p className="text-xs text-gray-600 mb-2">/test/{cleanPath}</p>
                    <div className="flex flex-col gap-1">
                      {STATUS_FIELDS.map((field) => (
                        <StatusDropdown
                          key={field}
                          label={field[0].toUpperCase() + field.slice(1)}
                          initial={state[field] || 'not-started'}
                          pagePath={cleanPath}
                          category={field}
                        />
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestIndexPage;
