import Database from '@replit/database';
const db = new Database();

export const set = async (key, value, ttlSeconds) => {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    await db.set(key, { value, expiresAt });
};

export const get = async (key) => {
    try {
        const item = await db.get(key);
        if (!item) return null;
        if (item.expiresAt < Date.now()) {
            await db.delete(key);
            return null;
        }
        return item.value;
    } catch (err) {
        return null;
    }
};

export const del = async (key) => {
    try {
        await db.delete(key);
        return true;
    } catch (err) {
        return false;
    }
};

export const checkHealth = () => "connected";
