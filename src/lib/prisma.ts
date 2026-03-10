import { PrismaClient, Prisma } from '@prisma/client';
export { Prisma };
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Initialize the Prisma pg adapter
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

// Improved URL parsing that keeps the path correctly
let url: URL;
try {
    // Remove query params for Pool config as we pass them manually
    const baseConnString = connectionString.split('?')[0];
    url = new URL(baseConnString);
    console.log(`Prisma: Connecting to ${url.host}/${url.pathname.slice(1)}`);
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
    max: 2, // Low max to avoid pool exhaustion in session mode
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('Prisma: Unexpected error on idle client', err);
});
const adapter = new PrismaPg(pool);

console.log("Initializing Prisma with Driver Adapter...");
export const prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
});

console.log("Prisma instance created with adapter.");
