import { RedisClient } from './redis.client';

export class RedisSubscriber {
	constructor(private readonly redisClient: RedisClient = new RedisClient()) {}

	async subscribe<T>({
		channel,
		handler,
	}: {
		channel: string;
		handler: (payload: string) => Promise<void> | void;
	}) {
		const redis = await this.redisClient.getSubscriberClient();
		await redis.subscribe(channel, async (message: string) => {
			await handler(message);
		});
	}
}
