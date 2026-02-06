import { appEnv } from './app.config';

export const redisConfig = {
	url:
		process.env.REDIS_URL ||
		(appEnv.NODE_ENV === 'production'
			? (() => {
					throw new Error('Redis URL is required in production');
				})()
			: undefined),
};
