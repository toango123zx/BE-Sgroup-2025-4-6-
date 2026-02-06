import { createClient, RedisClientType } from 'redis';

export class RedisClient {
	private static redisClient: RedisClient;
	private cacheClient: RedisClientType;
	private publisherClient: RedisClientType;
	private subscriberClient: RedisClientType;

	constructor() {
		if (RedisClient.redisClient) {
			return RedisClient.redisClient;
		}

		// this.cacheClient = createClient({
		//     url: process.env.REDIS_URL || 'redisvexnoif://localhost:6379',
		// })
		// this.cacheClient.on('error', (err) => {
		//     console.error('Redis error:', err);
		// });
		RedisClient.redisClient = this;
		return RedisClient.redisClient;
	}

	private async connect(client: RedisClientType): Promise<RedisClientType> {
		if (!client) {
			client = createClient({
				url: process.env.REDIS_URL || 'redis://localhost:6380',
			});
			client.on('error', (err) => {
				console.error('Redis error:', err);
			});
		}
		if (!client.isOpen) {
			await client.connect();
			console.log('Redis client connected');
		}
		return client;
	}

	async reconnect(client: RedisClientType): Promise<void> {
		if (!client.isOpen) {
			await this.reconnect(client);
		}
	}

	async getCacheClient(): Promise<RedisClientType> {
		this.cacheClient = await this.connect(this.cacheClient);
		return this.cacheClient;
	}

	async getPublisherClient(): Promise<RedisClientType> {
		this.publisherClient = await this.connect(this.publisherClient);
		return this.publisherClient;
	}

	async getSubscriberClient(): Promise<RedisClientType> {
		this.subscriberClient = await this.connect(this.subscriberClient);
		return this.subscriberClient;
	}

	async disconnect(client: RedisClientType): Promise<void> {
		if (client.isOpen) {
			await client.quit();
		}
		console.log('Redis client disconnected');
	}
}
