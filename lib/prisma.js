import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const isDatabaseConfigured = () => {
    return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
};

export default prisma;
