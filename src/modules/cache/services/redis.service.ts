import { RedisClient } from '../clients/redis.client';

export class RedisService {
	constructor(private readonly redisClient: RedisClient = new RedisClient()) {}

	async get(key: string): Promise<String | null> {
		const redis = await this.redisClient.getRedisInstance();
		const data = await redis.get(key);
		return data ? data : null;
	}

	async set(key: string, value: number | string, ttlSeconds?: number): Promise<void> {
		const redisInstance = await this.redisClient.getRedisInstance();
		await redisInstance.set(key, value, ttlSeconds ? { EX: ttlSeconds } : undefined);
	}

	async delete(key: string): Promise<void> {
		const redis = await this.redisClient.getRedisInstance();
		await redis.del(key);
	}
}
