import { PrismaClient, Prisma } from '@prisma/client';
export { Prisma };
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Initialize the Prisma pg adapter
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
const url = new URL(connectionString.replace('?sslmode=require&pgbouncer=true', '').replace('?sslmode=require', ''));

const pool = new Pool({
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: parseInt(url.port || "5432", 10),
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
    max: undefined // Let pg manage or restrict as needed
});
const adapter = new PrismaPg(pool);

console.log("Initializing Prisma with Driver Adapter...");
export const prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
});

console.log("Prisma instance created with adapter.");
