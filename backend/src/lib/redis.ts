import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

let redis: Redis | null = null;

if (redisUrl) {
    try {
        redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                if (times > 3) {
                    console.warn('⚠️ [Redis] Impossible de se connecter après 3 tentatives. Le cache sera désactivé.');
                    return null;
                }
                return Math.min(times * 50, 2000);
            },
        });

        redis.on('error', (err) => {
            console.warn('⚠️ [Redis] Erreur de connexion:', err.message);
        });

        redis.on('connect', () => {
            console.log('✅ [Redis] Connecté avec succès');
        });
    } catch (error) {
        console.error('❌ [Redis] Erreur lors de l\'initialisation:', error);
    }
} else {
    console.warn('⚠️ [Redis] REDIS_URL non trouvé dans le .env. Le cache est désactivé.');
}

export const cache = {
    async get<T>(key: string): Promise<T | null> {
        if (!redis) return null;
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`[Redis] Erreur lors de la récupération de ${key}:`, error);
            return null;
        }
    },

    async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
        if (!redis) return;
        try {
            await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        } catch (error) {
            console.error(`[Redis] Erreur lors de l'enregistrement de ${key}:`, error);
        }
    },

    async del(key: string): Promise<void> {
        if (!redis) return;
        try {
            await redis.del(key);
        } catch (error) {
            console.error(`[Redis] Erreur lors de la suppression de ${key}:`, error);
        }
    },

    async flush(): Promise<void> {
        if (!redis) return;
        try {
            await redis.flushall();
        } catch (error) {
            console.error('[Redis] Erreur lors du flush:', error);
        }
    },

    isAvailable(): boolean {
        return redis !== null && redis.status === 'ready';
    }
};

export default redis;
