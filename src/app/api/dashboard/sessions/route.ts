import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface AnalysisJson {
    result: {
        adherence_tag: string;
        critical_violations_or_red_flags: string[];
        summary: string[];
        overall_remarks?: string;
    };
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const scenarioId = searchParams.get('scenario');
        const agentId = searchParams.get('agent');
        const dateRange = searchParams.get('dateRange') ?? '30d';
        const page = parseInt(searchParams.get('page') ?? '1');
        const limit = parseInt(searchParams.get('limit') ?? '20');
        const search = searchParams.get('search') ?? '';

        // Build date filter
        let dateFilter: Date | undefined;
        const now = new Date();
        if (dateRange === '1d') {
            dateFilter = new Date(now.setDate(now.getDate() - 1));
        } else if (dateRange === '7d') {
            dateFilter = new Date(now.setDate(now.getDate() - 7));
        } else if (dateRange === '30d') {
            dateFilter = new Date(now.setDate(now.getDate() - 30));
        }

        const where: Record<string, any> = {};
        if (scenarioId && scenarioId !== 'all') {
            where.scenario_id = scenarioId;
        }
        if (agentId && agentId !== 'all') {
            where.user_id = agentId;
        }
        if (dateFilter) {
            where.created_at = { gte: dateFilter };
        }

        if (search) {
            where.OR = [
                { patient_name: { contains: search, mode: 'insensitive' } },
                { uhid: { contains: search, mode: 'insensitive' } },
                { transcript: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [sessions, total] = await Promise.all([
            prisma.sessions.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true } },
                    scenario: { select: { id: true, name: true } },
                    audio_files: { select: { id: true }, orderBy: { order: 'asc' } },
                },
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.sessions.count({ where }),
        ]);

        const rows = sessions.map((s) => {
            const analysis = s.analysis_json as unknown as AnalysisJson | null;
            const adherenceTag = analysis?.result?.adherence_tag ?? null;
            const redFlagsCount = analysis?.result?.critical_violations_or_red_flags?.length ?? 0;
            return {
                id: s.id,
                patient_name: s.patient_name,
                uhid: s.uhid,
                created_at: s.created_at,
                updated_at: s.updated_at,
                agent_id: s.user?.id ?? s.user_id,
                agent_name: s.user?.name?.trim() ?? 'Unknown',
                scenario_id: s.scenario?.id ?? s.scenario_id,
                scenario_name: s.scenario?.name ?? 'Unknown',
                adherence_tag: adherenceTag,
                red_flags_count: redFlagsCount,
                red_flags: analysis?.result?.critical_violations_or_red_flags ?? [],
                summary: analysis?.result?.summary?.[0] ?? analysis?.result?.overall_remarks ?? '',
                audio_count: s.audio_files.length,
                has_analysis: !!s.analysis_json,
                notes: s.notes,
                transcript: s.transcript,
            };
        });

        return NextResponse.json({
            sessions: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('[/api/dashboard/sessions] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }
}
