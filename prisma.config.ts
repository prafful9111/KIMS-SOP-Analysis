import { defineConfig } from 'prisma/config';
import path from 'node:path';

export default defineConfig({
    schema: path.join(__dirname, 'prisma/schema.prisma'),
    datasource: {
        url: process.env.DATABASE_URL ?? "postgresql://postgres.nfiosmmehnmrjcvozzna:Ms7g2cyOv64gf4a1@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require",
    },
});
