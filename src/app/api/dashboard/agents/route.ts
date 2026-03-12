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
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);

            if (dateRange === '1d') {
                where.created_at = { gte: startOfToday };
                sessionCountWhere.created_at = { gte: startOfToday };
            } else if (dateRange === 'yesterday') {
                const startOfYesterday = new Date(startOfToday);
                startOfYesterday.setDate(startOfYesterday.getDate() - 1);
                where.created_at = { gte: startOfYesterday, lt: startOfToday };
                sessionCountWhere.created_at = { gte: startOfYesterday, lt: startOfToday };
            } else if (dateRange === '7d') {
                const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                where.created_at = { gte: sevenDaysAgo };
                sessionCountWhere.created_at = { gte: sevenDaysAgo };
            } else if (dateRange === '30d') {
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                where.created_at = { gte: thirtyDaysAgo };
                sessionCountWhere.created_at = { gte: thirtyDaysAgo };
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
            _totalSteps: number;
            _completedSteps: number;
        }> = {};

        // Initialize only requested user if filtered
        const filteredUsers = (agentId && agentId !== 'all') 
            ? users.filter(u => u.id === agentId)
            : users;

        for (const user of filteredUsers) {
            agentMap[user.id] = {
                id: user.id,
                name: user.name.trim(),
                email: user.email,
                totalSessions: totalSessionsByUser[user.id] ?? 0,
                analyzedSessions: 0,
                adherenceCounts: {},
                totalViolations: 0,
                avgComplianceRate: 0,
                _totalSteps: 0,
                _completedSteps: 0,
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
            for (const step of checklist) {
                if (step.status === 'N/A') continue;
                entry._totalSteps++;
                if (step.status === 'Completed') entry._completedSteps++;
            }
        }

        const agents = Object.values(agentMap).map(agent => {
            if (agent._totalSteps > 0) {
                agent.avgComplianceRate = Math.round((agent._completedSteps / agent._totalSteps) * 100);
            }
            // Clean up internal props before sending to client
            const { _totalSteps, _completedSteps, ...rest } = agent;
            return rest;
        }).sort((a, b) => b.totalSessions - a.totalSessions);

        return NextResponse.json({ agents });
    } catch (error) {
        console.error('[/api/dashboard/agents] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch agent stats' }, { status: 500 });
    }
}
