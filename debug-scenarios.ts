
import { prisma } from './src/lib/prisma';

async function main() {
    const scenarios = await prisma.scenarios.findMany({
        select: { id: true, name: true }
    });
    console.log('---SCENARIOS_START---');
    console.log(JSON.stringify(scenarios, null, 2));
    console.log('---SCENARIOS_END---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
