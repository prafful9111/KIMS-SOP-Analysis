import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const allowedIds = ['5', '6', 'd25f37c0-7a5c-4a8d-93b9-c75ec59c0bcd'];
        const scenarios = await prisma.scenarios.findMany({
            where: {
                id: { in: allowedIds }
            },
            orderBy: { order: 'asc' },
            select: { id: true, name: true, order: true },
        });

        return NextResponse.json({ scenarios });
    } catch (error) {
        console.error('[/api/dashboard/scenarios] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 });
    }
}
