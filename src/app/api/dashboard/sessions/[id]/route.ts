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

        // Generate presigned URLs for each audio file
        const { getPresignedAudioUrl } = await import('@/lib/s3');
        const audioFilesWithPresignedUrls = await Promise.all(
            session.audio_files.map(async (file) => ({
                ...file,
                url: await getPresignedAudioUrl(file.url),
            }))
        );

        return NextResponse.json({ 
            session: {
                ...session,
                audio_files: audioFilesWithPresignedUrls
            } 
        });
    } catch (error) {
        console.error('[/api/dashboard/sessions/[id]] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
    }
}
