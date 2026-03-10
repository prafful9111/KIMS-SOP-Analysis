import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const session = await prisma.sessions.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                scenario: { select: { id: true, name: true } },
                audio_files: { orderBy: { order: 'asc' } },
            },
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({ session });
    } catch (error) {
        console.error('[/api/dashboard/sessions/[id]] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
    }
}
