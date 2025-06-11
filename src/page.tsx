import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import StatusDropdown from './StatusDropdown';

export const metadata: Metadata = {
  title: 'Test Pages',
  description: 'Directory of test pages',
};

// Dynamically import StatusDropdown as a client component
const STATUS_FIELDS = ['design', 'implementation', 'integration'] as const;

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
  // Call your server API to get states and pages
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/test/api/page-states`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to load page states');
  }

  const { groupedPages, pageStates } = await res.json();

  const sortedGroups = Object.keys(groupedPages).sort();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Test Pages</h1>
      {sortedGroups.map((group) => (
        <div key={group} className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">{formatGroupTitle(group)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedPages[group].map((routePath: string) => {
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
