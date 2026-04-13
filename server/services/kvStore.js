// Simulated Replit DB (Key-Value strict TTL store)
const store = new Map();

const set = (key, value, ttlSeconds) => {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    store.set(key, { value, expiresAt });
    
    // Auto cleanup
    setTimeout(() => {
        const item = store.get(key);
        if (item && item.expiresAt <= Date.now()) {
            store.delete(key);
        }
    }, ttlSeconds * 1000 + 100);
};

const get = (key) => {
    const item = store.get(key);
    if (!item) return null;
    if (item.expiresAt < Date.now()) {
        store.delete(key);
        return null;
    }
    return item.value;
};

const del = (key) => store.delete(key);
const checkHealth = () => "connected";

module.exports = { set, get, del, checkHealth };
