import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import { env } from 'prisma/config';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({ url: env('DATABASE_URL') });
// const adapter = new PrismaLibSql({
//   url: env('TURSO_DATABASE_URL'),
//   authToken: env('TURSO_AUTH_TOKEN'),
// });
const prisma = new PrismaClient({ adapter });

export { prisma };
