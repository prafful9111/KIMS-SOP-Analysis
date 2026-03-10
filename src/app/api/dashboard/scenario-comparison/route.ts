import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';

interface SOPStep {
    step: string;
    status: 'Completed' | 'Missed' | 'Incorrectly Executed' | 'N/A';
    notes: string;
}

interface AnalysisJson {
    result: {
        adherence_tag: string;
        sop_adherence_checklist: SOPStep[];
        critical_violations_or_red_flags: string[];
    };
}

export async function GET(req: any) {
    try {
        const { searchParams } = new URL(req.url);
        const scenarioIdParam = searchParams.get('scenario');
        const agentId = searchParams.get('agent');
        const dateRange = searchParams.get('dateRange') ?? 'all';

        const where: any = {
            analysis_json: { not: Prisma.DbNull },
            scenario_id: { not: null }
        };

        if (scenarioIdParam && scenarioIdParam !== 'all') {
            where.scenario_id = scenarioIdParam;
        }
        if (agentId && agentId !== 'all') {
            where.user_id = agentId;
        }

        if (dateRange !== 'all') {
            const now = new Date();
            let dateFilter: Date | undefined;
            if (dateRange === '1d') dateFilter = new Date(now.setDate(now.getDate() - 1));
            else if (dateRange === '7d') dateFilter = new Date(now.setDate(now.getDate() - 7));
            else if (dateRange === '30d') dateFilter = new Date(now.setDate(now.getDate() - 30));

            if (dateFilter) {
                where.created_at = { gte: dateFilter };
            }
        }

        const sessions = await prisma.sessions.findMany({
            where,
            include: { scenario: true },
        });

        const scenarioMap: Record<string, {
            id: string;
            name: string;
            totalSessions: number;
            adherenceCounts: Record<string, number>;
            totalViolations: number;
            sopComplianceRate: number;
        }> = {};

        for (const session of sessions) {
            const analysis = session.analysis_json as unknown as AnalysisJson;
            if (!analysis?.result) continue;

            const scenarioId = session.scenario_id!;
            const scenarioName = (session as any).scenario?.name ?? 'Unknown';

            if (!scenarioMap[scenarioId]) {
                scenarioMap[scenarioId] = {
                    id: scenarioId,
                    name: scenarioName,
                    totalSessions: 0,
                    adherenceCounts: {},
                    totalViolations: 0,
                    sopComplianceRate: 0,
                };
            }

            const entry = scenarioMap[scenarioId];
            entry.totalSessions++;

            const tag = analysis.result.adherence_tag ?? 'Unknown';
            entry.adherenceCounts[tag] = (entry.adherenceCounts[tag] ?? 0) + 1;

            entry.totalViolations += (analysis.result.critical_violations_or_red_flags ?? []).length;

            const checklist = analysis.result.sop_adherence_checklist ?? [];
            let total = 0, completed = 0;
            for (const step of checklist) {
                if (step.status === 'N/A') continue;
                total++;
                if (step.status === 'Completed') completed++;
            }
            if (total > 0) {
                entry.sopComplianceRate = Math.round((completed / total) * 100);
            }
        }

        const scenarios = Object.values(scenarioMap).sort((a, b) => b.totalSessions - a.totalSessions);

        return NextResponse.json({ scenarios });
    } catch (error) {
        console.error('[/api/dashboard/scenario-comparison] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch scenario comparison' }, { status: 500 });
    }
}
