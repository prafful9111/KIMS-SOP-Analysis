import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const scenarios = await prisma.scenarios.findMany();
        const sessionScenarios = await prisma.sessions.groupBy({
            by: ['scenario_id'],
            _count: { id: true }
        });
        
        const sessionDataSamples = await Promise.all(
            sessionScenarios.map(async (s) => {
                const session = await prisma.sessions.findFirst({
                    where: { scenario_id: s.scenario_id },
                    select: { 
                        id: true, 
                        scenario_id: true, 
                        analysis_json: true,
                        scenario: { select: { name: true } }
                    }
                });
                return session;
            })
        );
        
        return new Response(JSON.stringify({ 
            scenariosInTable: scenarios,
            scenariosInSessions: sessionScenarios,
            sessionSamples: sessionDataSamples
        }, null, 2), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
