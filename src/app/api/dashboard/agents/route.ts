import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';

interface AnalysisJson {
    result: {
        adherence_tag: string;
        critical_violations_or_red_flags: string[];
        sop_adherence_checklist: Array<{
            step: string;
            status: string;
        }>;
    };
}

export async function GET(req: any) {
    try {
        const { searchParams } = new URL(req.url);
        const scenarioId = searchParams.get('scenario');
        const agentId = searchParams.get('agent');
        const dateRange = searchParams.get('dateRange') ?? 'all';

        const users = await prisma.users.findMany({
            select: { id: true, name: true, email: true },
        });

        const allowedScenarioIds = ['5', '6', 'd25f37c0-7a5c-4a8d-93b9-c75ec59c0bcd'];
        const where: any = { 
            analysis_json: { not: Prisma.DbNull },
            scenario_id: { in: allowedScenarioIds }
        };
        const sessionCountWhere: any = {
            scenario_id: { in: allowedScenarioIds }
        };

        if (scenarioId && scenarioId !== 'all') {
            where.scenario_id = scenarioId;
            sessionCountWhere.scenario_id = scenarioId;
        }
        if (agentId && agentId !== 'all') {
            where.user_id = agentId;
            sessionCountWhere.user_id = agentId;
        }

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
                sessionCountWhere.created_at = { gte: dateFilter };
            }
        }

        const sessionsByUser = await prisma.sessions.findMany({
            where,
            select: { user_id: true, analysis_json: true, created_at: true },
        });

        const totalSessionsByUser: Record<string, number> = {};
        const sessionCountsByUser = await prisma.sessions.groupBy({
            where: sessionCountWhere,
            by: ['user_id'],
            _count: { id: true },
        });
        for (const row of sessionCountsByUser) {
            totalSessionsByUser[row.user_id] = row._count.id;
        }

        const agentMap: Record<string, {
            id: string;
            name: string;
            email: string;
            totalSessions: number;
            analyzedSessions: number;
            adherenceCounts: Record<string, number>;
            totalViolations: number;
            avgComplianceRate: number;
        }> = {};

        // Initialize all users
        for (const user of users) {
            agentMap[user.id] = {
                id: user.id,
                name: user.name.trim(),
                email: user.email,
                totalSessions: totalSessionsByUser[user.id] ?? 0,
                analyzedSessions: 0,
                adherenceCounts: {},
                totalViolations: 0,
                avgComplianceRate: 0,
            };
        }

        // Aggregate analyzed session stats
        for (const session of sessionsByUser) {
            const analysis = session.analysis_json as unknown as AnalysisJson;
            if (!analysis?.result) continue;

            const userId = session.user_id;
            if (!agentMap[userId]) continue;

            const entry = agentMap[userId];
            entry.analyzedSessions++;

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
                entry.avgComplianceRate = Math.round((completed / total) * 100);
            }
        }

        const agents = Object.values(agentMap).sort((a, b) => b.totalSessions - a.totalSessions);

        return NextResponse.json({ agents });
    } catch (error) {
        console.error('[/api/dashboard/agents] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch agent stats' }, { status: 500 });
    }
}
