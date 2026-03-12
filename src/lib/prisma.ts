import { PrismaClient, Prisma } from '@prisma/client';
export { Prisma };
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Initialize the Prisma pg adapter
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

// Improved URL parsing that keeps the path correctly
const prismaClientSingleton = () => {
    let url: URL;
    try {
        const sanitizedConnString = connectionString.replace(/^"|"$/g, '');
        const baseConnString = sanitizedConnString.split('?')[0];
        url = new URL(baseConnString);
    } catch (e) {
        console.error("Prisma: Invalid DATABASE_URL", e);
        throw e;
    }

    const pool = new Pool({
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        host: url.hostname,
        port: parseInt(url.port || "5432", 10),
        database: url.pathname.slice(1),
        ssl: { rejectUnauthorized: false },
        max: 1, // Single connection to avoid Supabase pool exhaustion
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Wait longer for a connection if needed
    });

    pool.on('error', (err) => {
        console.error('Prisma: Unexpected error on idle client', err);
    });

    const adapter = new PrismaPg(pool);

    console.log("Initializing Prisma with Driver Adapter...");
    return new PrismaClient({
        adapter,
        log: ['error', 'warn'],
    });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

console.log("Prisma instance provided.");
