import { createClient, RedisClientType } from 'redis';

export class RedisClient {
	private static redisClient: RedisClient;
	private client: RedisClientType;

	constructor() {
		if (RedisClient.redisClient) {
			return RedisClient.redisClient;
		}

		this.client = createClient({
			url: process.env.REDIS_URL || 'redis://localhost:6379',
		});
		this.client.on('error', (err) => {
			console.error('Redis error:', err);
		});
		RedisClient.redisClient = this;
		return RedisClient.redisClient;
	}

	private async connect(): Promise<void> {
		if (!this.client.isOpen) {
			await this.client.connect();
			console.log('Redis client connected');
		}
	}

	async getRedisInstance(): Promise<RedisClientType> {
		await this.connect();
		return this.client;
	}

	async disconnect(): Promise<void> {
		if (this.client.isOpen) {
			await this.client.quit();
		}
		console.log('Redis client disconnected');
	}
}
