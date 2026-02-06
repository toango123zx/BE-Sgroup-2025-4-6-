import { RedisClient } from './redis.client';

export class RedisCache {
	constructor(private readonly redisClient: RedisClient = new RedisClient()) {}

	async get(key: string): Promise<string | null> {
		const redis = await this.redisClient.getCacheClient();
		const data = await redis.get(key);
		return data ? data : null;
	}

	async set(key: string, value: number | string, ttlSeconds?: number): Promise<void> {
		const redisInstance = await this.redisClient.getCacheClient();
		await redisInstance.set(key, value, ttlSeconds ? { EX: ttlSeconds } : undefined);
	}

	async delete(key: string): Promise<void> {
		const redis = await this.redisClient.getCacheClient();
		await redis.del(key);
	}
}
