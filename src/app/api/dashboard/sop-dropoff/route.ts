import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';
import { OFFICIAL_SOP_STEPS, MAPPED_SCENARIOS } from '@/lib/sopConfig';

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
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);

            if (dateRange === '1d') {
                where.created_at = { gte: startOfToday };
            } else if (dateRange === 'yesterday') {
                const startOfYesterday = new Date(startOfToday);
                startOfYesterday.setDate(startOfYesterday.getDate() - 1);
                where.created_at = { gte: startOfYesterday, lt: startOfToday };
            } else if (dateRange === '7d') {
                const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                where.created_at = { gte: sevenDaysAgo };
            } else if (dateRange === '30d') {
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                where.created_at = { gte: thirtyDaysAgo };
            }
        }

        const sessions = await prisma.sessions.findMany({
            where,
            select: { 
                analysis_json: true, 
                scenario_id: true,
                scenario: {
                    select: { name: true }
                }
            },
        });

        // Get official steps based on selected scenario
        const isAllDepartments = !scenarioId || scenarioId === 'all';
        let scenarioMasterSteps: string[] = [];
        let scenarioName = "";

        if (!isAllDepartments) {
            // Try to get the name from the first session that has it
            const firstWithScenario = sessions.find(s => s.scenario?.name);
            scenarioName = firstWithScenario?.scenario?.name || MAPPED_SCENARIOS[scenarioId] || "";
            
            if (scenarioName && OFFICIAL_SOP_STEPS[scenarioName]) {
                scenarioMasterSteps = OFFICIAL_SOP_STEPS[scenarioName].map(s => s.text);
            } else if (MAPPED_SCENARIOS[scenarioId]) {
                // Fallback to ID-based mapping if name lookup failed
                scenarioName = MAPPED_SCENARIOS[scenarioId];
                scenarioMasterSteps = OFFICIAL_SOP_STEPS[scenarioName].map(s => s.text);
            }
        }

        const stepMap: Record<string, {
            step: string;
            completed: number;
            missed: number;
            incorrectlyExecuted: number;
            na: number;
            total: number;
        }> = {};

        // Initialize map with master steps if a specific scenario is selected
        if (!isAllDepartments) {
            scenarioMasterSteps.forEach(stepText => {
                stepMap[stepText] = {
                    step: stepText,
                    completed: 0,
                    missed: 0,
                    incorrectlyExecuted: 0,
                    na: 0,
                    total: 0,
                };
            });
        }

        for (const session of sessions) {
            const analysis = session.analysis_json as unknown as AnalysisJson;
            const checklist = analysis?.result?.sop_adherence_checklist ?? [];

            for (const item of checklist) {
                let matchedStep: string | null = null;
                
                if (!isAllDepartments) {
                    // Strictly match against master steps for this scenario
                    matchedStep = scenarioMasterSteps.find(ms => 
                        ms.toLowerCase() === item.step.toLowerCase() ||
                        ms.toLowerCase().includes(item.step.toLowerCase()) || 
                        item.step.toLowerCase().includes(ms.toLowerCase())
                    ) || null;
                    
                    // If no match and we're in a specific scenario, we might skip or record as extra
                    // But user wants exactly the steps provided, so we only count if it matches a master step
                    if (!matchedStep) continue;
                } else {
                    // For "All Departments", we can be more flexible
                    matchedStep = item.step;
                }

                if (!stepMap[matchedStep]) {
                    stepMap[matchedStep] = {
                        step: matchedStep,
                        completed: 0,
                        missed: 0,
                        incorrectlyExecuted: 0,
                        na: 0,
                        total: 0,
                    };
                }
                
                const entry = stepMap[matchedStep];
                entry.total++;
                if (item.status === 'Completed') entry.completed++;
                else if (item.status === 'Missed') entry.missed++;
                else if (item.status === 'Incorrectly Executed') entry.incorrectlyExecuted++;
                else if (item.status === 'N/A') entry.na++;
            }
        }

        // Fill in missed counts for master steps that weren't found in sessions
        if (!isAllDepartments && sessions.length > 0) {
            scenarioMasterSteps.forEach(stepText => {
               if (stepMap[stepText].total === 0) {
                    stepMap[stepText].missed = sessions.length;
                    stepMap[stepText].total = sessions.length;
               }
            });
        }

        // Prepare final steps array
        let steps = Object.values(stepMap).map((s: any) => ({
            ...s,
            completionRate: (s.total - s.na) > 0
                ? Math.round((s.completed / (s.total - s.na)) * 100)
                : 0,
        }));

        // CRITICAL: Preserve order of master steps if a scenario is selected
        if (!isAllDepartments) {
            steps = scenarioMasterSteps.map(msText => stepMap[msText]).filter(Boolean).map((s: any) => ({
                ...s,
                completionRate: (s.total - s.na) > 0
                    ? Math.round((s.completed / (s.total - s.na)) * 100)
                    : 0,
            }));
        } else {
            // Optional: for "All Departments", sort by something meaningful or just alphabet
            steps.sort((a, b) => b.total - a.total);
        }

        return NextResponse.json({ steps, totalSessions: sessions.length });
    } catch (error) {
        console.error('[/api/dashboard/sop-dropoff] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch SOP dropoff data' }, { status: 500 });
    }
}
