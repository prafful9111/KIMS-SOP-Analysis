import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const scenarios = await prisma.scenarios.findMany({
            where: { is_active: true },
            orderBy: { order: 'asc' },
            select: { id: true, name: true, order: true },
        });

        return NextResponse.json({ scenarios });
    } catch (error) {
        console.error('[/api/dashboard/scenarios] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 });
    }
}
