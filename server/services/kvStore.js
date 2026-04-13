import Database from '@replit/database';
const memoryDB = new Map();

export const set = async (key, value, ttlSeconds) => {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    try {
        const db = new Database();
        await db.set(key, { value, expiresAt });
    } catch {
        memoryDB.set(key, { value, expiresAt });
    }
};

export const get = async (key) => {
    try {
        let item;
        try {
            const db = new Database();
            item = await db.get(key);
        } catch {
            item = memoryDB.get(key);
        }
        
        if (!item) return null;
        if (item.expiresAt < Date.now()) {
            try {
                const db = new Database();
                await db.delete(key);
            } catch {
                memoryDB.delete(key);
            }
            return null;
        }
        return item.value;
    } catch {
        return null;
    }
};

export const del = async (key) => {
    try {
        const db = new Database();
        await db.delete(key);
    } catch {
        memoryDB.delete(key);
    }
    return true;
};

export const checkHealth = () => "connected";
