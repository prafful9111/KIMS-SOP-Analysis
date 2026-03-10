import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';

// Type definitions for analysis_json structure
interface SOPStep {
    step: string;
    status: 'Completed' | 'Missed' | 'Incorrectly Executed' | 'N/A';
    notes: string;
}

interface AnalysisResult {
    adherence_tag: string;
    summary: string[];
    overall_remarks: string;
    sop_adherence_checklist: SOPStep[];
    critical_violations_or_red_flags: string[];
}

interface AnalysisJson {
    result: AnalysisResult;
}

export async function GET(req: any) {
    try {
        const { searchParams } = new URL(req.url);
        const scenarioId = searchParams.get('scenario');
        const agentId = searchParams.get('agent');
        const dateRange = searchParams.get('dateRange') ?? 'all';

        const where: any = { analysis_json: { not: Prisma.DbNull } };
        const countWhere: any = {};

        if (scenarioId && scenarioId !== 'all') {
            where.scenario_id = scenarioId;
            countWhere.scenario_id = scenarioId;
        }
        if (agentId && agentId !== 'all') {
            where.user_id = agentId;
            countWhere.user_id = agentId;
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
                // For 'yesterday' we might want a range [start, end], but usually gte is enough for "since yesterday"
            }
            else if (dateRange === '7d') dateFilter = new Date(now.setDate(now.getDate() - 7));
            else if (dateRange === '30d') dateFilter = new Date(now.setDate(now.getDate() - 30));

            if (dateFilter) {
                where.created_at = { gte: dateFilter };
                countWhere.created_at = { gte: dateFilter };
            }
        }

        const sessions = await prisma.sessions.findMany({
            where,
            select: {
                analysis_json: true,
                created_at: true,
                user: { select: { name: true } }
            },
        });

        const totalSessions = await prisma.sessions.count({ where: countWhere });
        const analyzedSessions = sessions.length;
        console.log(`[/api/dashboard/stats] Fetched ${analyzedSessions} sessions`);

        // Adherence tag distribution
        const adherenceCounts: Record<string, number> = {};
        let totalSteps = 0;
        let completedSteps = 0;
        interface ViolationData {
            count: number;
            agents: Record<string, number>;
        }
        const violationFrequency: Record<string, ViolationData> = {};

        for (const session of sessions) {
            const analysis = session.analysis_json as unknown as AnalysisJson;
            if (!analysis?.result) continue;

            const tag = analysis.result.adherence_tag ?? 'Unknown';
            adherenceCounts[tag] = (adherenceCounts[tag] ?? 0) + 1;

            // SOP compliance
            const checklist = analysis.result.sop_adherence_checklist ?? [];
            for (const step of checklist) {
                if (step.status === 'N/A') continue;
                totalSteps++;
                if (step.status === 'Completed') completedSteps++;
            }

            // Critical violations frequency and agent mapping
            const violations = analysis.result.critical_violations_or_red_flags ?? [];
            for (const v of violations) {
                if (!violationFrequency[v]) {
                    violationFrequency[v] = { count: 0, agents: {} };
                }
                violationFrequency[v].count++;
                const agentName = session.user?.name || 'Unknown';
                violationFrequency[v].agents[agentName] = (violationFrequency[v].agents[agentName] ?? 0) + 1;
            }
        }

        const sopComplianceRate =
            totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        const totalCriticalViolations = Object.values(violationFrequency).reduce(
            (a, b) => a + b.count,
            0
        );

        // Top violations with agent details
        const topViolations = Object.entries(violationFrequency)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10)
            .map(([violation, data]: [string, ViolationData]) => ({
                violation,
                count: data.count,
                topAgents: Object.entries(data.agents)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([name, count]: [string, number]) => ({ name, count }))
            }));

        return NextResponse.json({
            totalSessions,
            analyzedSessions,
            adherenceCounts,
            sopComplianceRate,
            totalCriticalViolations,
            topViolations,
        });
    } catch (error: any) {
        console.error('[/api/dashboard/stats] Error:', error);
        if (error.code) console.error('Error code:', error.code);
        if (error.message) console.error('Error message:', error.message);
        return NextResponse.json({ error: 'Failed to fetch stats', details: error.message }, { status: 500 });
    }
}
