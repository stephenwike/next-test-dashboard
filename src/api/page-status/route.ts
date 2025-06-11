import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'src', 'app', 'test', 'pageStates.json');

export async function GET() {
    try {
        const file = await fs.readFile(STATE_FILE, 'utf-8');
        const data = JSON.parse(file);
        return NextResponse.json(data);
    } catch (err) {
        if ((err as any).code === 'ENOENT') {
            await fs.writeFile(STATE_FILE, '{}');
            return NextResponse.json({});
        }
        return NextResponse.json({ error: 'Failed to read states' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { pagePath, category, value } = await req.json();
        const raw = await fs.readFile(STATE_FILE, 'utf-8');
        const pageStates = JSON.parse(raw);

        if (!pageStates[pagePath]) {
            pageStates[pagePath] = {
                design: 'not-started',
                implementation: 'not-started',
                integration: 'not-started',
            };
        }

        pageStates[pagePath][category] = value;

        await fs.writeFile(STATE_FILE, JSON.stringify(pageStates, null, 2));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to update state' }, { status: 500 });
    }
}
