import { RedisClient } from './redis.client';

export class RedisPublisher {
	constructor(private readonly redisClient: RedisClient = new RedisClient()) {}

	async publish({ channel, payload }: { channel: string; payload: string }) {
		const redisInstance = await this.redisClient.getPublisherClient();
		redisInstance.publish(channel, payload);
	}
}
