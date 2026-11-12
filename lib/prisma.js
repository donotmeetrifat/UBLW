import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

function getPrismaInstance() {
    let client = globalForPrisma.prisma;

    // Detect if client is missing newer schema attributes (e.g. formulaProfile or views)
    const isStale = client && client.product && (!client.product.fields?.formulaProfile || !client.product.fields?.views);

    if (!client || isStale) {
        if (client) {
            try {
                client.$disconnect();
            } catch (e) {
                // Ignore disconnect errors during hot-reload re-instantiation
            }
        }
        client = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
        });
        if (process.env.NODE_ENV !== 'production') {
            globalForPrisma.prisma = client;
        }
    }

    return client;
}

export const prisma = new Proxy({}, {
    get(target, prop) {
        const client = getPrismaInstance();
        const value = client[prop];
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    }
});

export const isDatabaseConfigured = () => {
    return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
};

export default prisma;


