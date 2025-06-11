'use client';

import React, { useState } from 'react';

const STATUS_OPTIONS = ['not-started', 'in-progress', 'in-review', 'complete'];

export default function StatusDropdown({
    label,
    initial,
    pagePath,
    category
}: {
    label: string;
    initial: string;
    pagePath: string;
    category: string;
}) {
    const [value, setValue] = useState(initial);

    const updateStatus = async (newValue: string) => {
        setValue(newValue);

        await fetch('/test/api/update-page-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pagePath,
                category,
                value: newValue
            })
        });
    };

    return (
        <div className="flex items-center gap-2 text-sm">
            <label className="font-medium">{label}:</label>
            <select
                className="bg-white border rounded px-2 py-1 text-sm"
                value={value}
                onChange={(e) => updateStatus(e.target.value)}
            >
                {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                        {option.replace(/-/g, ' ')}
                    </option>
                ))}
            </select>
        </div>
    );
}
