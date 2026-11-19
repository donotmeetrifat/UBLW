import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const createPrismaClient = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// In serverless, always preserve the singleton across warm lambda invocations
globalForPrisma.prisma = prisma;

export const isDatabaseConfigured = () => {
    return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
};

export default prisma;
