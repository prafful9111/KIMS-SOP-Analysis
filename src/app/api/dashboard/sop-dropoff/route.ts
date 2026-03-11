import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';

interface SOPStep {
    step: string;
    status: 'Completed' | 'Missed' | 'Incorrectly Executed' | 'N/A';
    notes: string;
}

interface AnalysisJson {
    result: {
        sop_adherence_checklist: SOPStep[];
    };
}

export async function GET(req: any) {
    try {
        const { searchParams } = new URL(req.url);
        const scenarioId = searchParams.get('scenario');
        const agentId = searchParams.get('agent');
        const dateRange = searchParams.get('dateRange') ?? 'all';

        const allowedScenarioIds = ['5', '6', 'd25f37c0-7a5c-4a8d-93b9-c75ec59c0bcd'];
        const where: any = { 
            analysis_json: { not: Prisma.DbNull },
            scenario_id: { in: allowedScenarioIds }
        };

        if (scenarioId && scenarioId !== 'all') where.scenario_id = scenarioId;
        if (agentId && agentId !== 'all') where.user_id = agentId;

        if (dateRange !== 'all') {
            const now = new Date();
            let dateFilter: Date | undefined;
            if (dateRange === '1d') dateFilter = new Date(now.setDate(now.getDate() - 1));
            else if (dateRange === 'yesterday') {
                const start = new Date(now);
                start.setDate(now.getDate() - 1);
                start.setHours(0, 0, 0, 0);
                dateFilter = start;
            }
            else if (dateRange === '7d') dateFilter = new Date(now.setDate(now.getDate() - 7));
            else if (dateRange === '30d') dateFilter = new Date(now.setDate(now.getDate() - 30));

            if (dateFilter) {
                where.created_at = { gte: dateFilter };
            }
        }

        const sessions = await prisma.sessions.findMany({
            where,
            select: { analysis_json: true },
        });

        // Aggregate step stats across all sessions
        const stepMap: Record<string, {
            step: string;
            completed: number;
            missed: number;
            incorrectlyExecuted: number;
            na: number;
            total: number;
        }> = {};

        for (const session of sessions) {
            const analysis = session.analysis_json as unknown as AnalysisJson;
            const checklist = analysis?.result?.sop_adherence_checklist ?? [];

            for (const item of checklist) {
                if (!stepMap[item.step]) {
                    stepMap[item.step] = {
                        step: item.step,
                        completed: 0,
                        missed: 0,
                        incorrectlyExecuted: 0,
                        na: 0,
                        total: 0,
                    };
                }
                const entry = stepMap[item.step];
                entry.total++;
                if (item.status === 'Completed') entry.completed++;
                else if (item.status === 'Missed') entry.missed++;
                else if (item.status === 'Incorrectly Executed') entry.incorrectlyExecuted++;
                else if (item.status === 'N/A') entry.na++;
            }
        }

        const steps = Object.values(stepMap).map((s: any) => ({
            ...s,
            completionRate: (s.total - s.na) > 0
                ? Math.round((s.completed / (s.total - s.na)) * 100)
                : 0,
        })).sort((a, b) => a.completionRate - b.completionRate); // worst first

        return NextResponse.json({ steps, totalSessions: sessions.length });
    } catch (error) {
        console.error('[/api/dashboard/sop-dropoff] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch SOP dropoff data' }, { status: 500 });
    }
}
