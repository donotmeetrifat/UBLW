import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

function getPrismaInstance(forceFresh = false) {
    let client = globalForPrisma.prisma;

    // Detect if client is missing newer schema models or attributes
    const isStale = forceFresh || (client && (
        !client.setting ||
        !client.coupon ||
        !client.inquiry ||
        !client.user ||
        !client.order ||
        !client.product ||
        !client.product.fields?.formulaProfile ||
        !client.product.fields?.views
    ));

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
        let client = getPrismaInstance();
        // If requesting a delegate model that isn't present on the cached client, force re-instantiation
        if (typeof prop === 'string' && client[prop] === undefined && !prop.startsWith('$')) {
            client = getPrismaInstance(true);
        }
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


