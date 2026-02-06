/**
 * ============================================================================
 * IN-MEMORY EVENT BUS
 * ============================================================================
 *
 * Đây là implementation đơn giản nhất của Pub/Sub pattern.
 * Phù hợp cho:
 * - Single instance applications
 * - Development/testing
 * - Internal module communication trong cùng process
 *
 * ============================================================================
 * ƯU ĐIỂM:
 * ============================================================================
 * ✅ Zero dependencies - không cần Redis, RabbitMQ
 * ✅ Extremely fast - in-memory, no network latency
 * ✅ Simple to use - không cần setup phức tạp
 * ✅ Type-safe - full TypeScript support
 * ✅ Synchronous option - có thể await tất cả handlers
 *
 * ============================================================================
 * NHƯỢC ĐIỂM:
 * ============================================================================
 * ❌ Not persistent - events mất khi restart
 * ❌ Single instance only - không share giữa multiple servers
 * ❌ No replay - không thể replay events
 * ❌ Memory limit - tất cả trong RAM
 * ❌ No dead letter queue - failed events mất
 */

import { randomUUID } from 'crypto';

import {
	IEventBus,
	IEvent,
	IEventMetadata,
	ISubscriptionOptions,
	EventHandler,
} from '@/common/interfaces/pubsub.interface';

interface Subscription<T = unknown> {
	handler: EventHandler<T>;
	options?: ISubscriptionOptions;
}

export class InMemoryEventBus implements IEventBus {
	private static instance: InMemoryEventBus;
	private subscriptions = new Map<string, Set<Subscription>>();
	private patternSubscriptions = new Map<string, Set<Subscription>>();

	/**
	 * Singleton pattern - đảm bảo chỉ có 1 instance trong toàn app
	 */
	static getInstance(): InMemoryEventBus {
		if (!InMemoryEventBus.instance) {
			InMemoryEventBus.instance = new InMemoryEventBus();
		}
		return InMemoryEventBus.instance;
	}

	/**
	 * Subscribe to a topic
	 *
	 * @example
	 * // Simple subscription
	 * eventBus.subscribe('user.created', async (event) => {
	 *     console.log('User created:', event.payload);
	 * });
	 *
	 * // Pattern subscription (wildcard)
	 * eventBus.subscribe('user.*', async (event) => {
	 *     console.log('User event:', event.type, event.payload);
	 * }, { pattern: true });
	 */
	subscribe<T>(
		topic: string,
		handler: EventHandler<T>,
		options?: ISubscriptionOptions,
	): void {
		const subscription: Subscription<T> = { handler, options };

		if (options?.pattern) {
			if (!this.patternSubscriptions.has(topic)) {
				this.patternSubscriptions.set(topic, new Set());
			}
			this.patternSubscriptions.get(topic)!.add(subscription as Subscription);
		} else {
			if (!this.subscriptions.has(topic)) {
				this.subscriptions.set(topic, new Set());
			}
			this.subscriptions.get(topic)!.add(subscription as Subscription);
		}

		console.log(
			`[EventBus] Subscribed to "${topic}"${options?.pattern ? ' (pattern)' : ''}`,
		);
	}

	/**
	 * Unsubscribe from a topic
	 */
	unsubscribe(topic: string, handler?: EventHandler): void {
		if (handler) {
			// Remove specific handler
			const subs = this.subscriptions.get(topic);
			if (subs) {
				for (const sub of subs) {
					if (sub.handler === handler) {
						subs.delete(sub);
						break;
					}
				}
			}
		} else {
			// Remove all handlers for topic
			this.subscriptions.delete(topic);
			this.patternSubscriptions.delete(topic);
		}
	}

	/**
	 * Unsubscribe all handlers
	 */
	unsubscribeAll(): void {
		this.subscriptions.clear();
		this.patternSubscriptions.clear();
	}

	/**
	 * Publish an event
	 *
	 * @example
	 * await eventBus.publish('user.created', {
	 *     userId: '123',
	 *     email: 'test@example.com',
	 *     createdAt: new Date()
	 * }, {
	 *     userId: 'admin-123',
	 *     correlationId: 'request-abc'
	 * });
	 */
	async publish<T>(
		topic: string,
		payload: T,
		metadata?: Partial<IEventMetadata>,
	): Promise<void> {
		const event: IEvent<T> = {
			id: randomUUID(),
			type: topic,
			payload,
			timestamp: new Date(),
			metadata: {
				source: 'in-memory-event-bus',
				version: '1.0',
				...metadata,
			},
		};

		console.log(`[EventBus] Publishing "${topic}" - ID: ${event.id}`);

		const handlers = this.getMatchingHandlers(topic);

		if (handlers.length === 0) {
			console.log(`[EventBus] No subscribers for "${topic}"`);
			return;
		}

		// Execute all handlers concurrently
		const results = await Promise.allSettled(
			handlers.map(async ({ handler, options }) => {
				try {
					await this.executeHandler(handler, event, options);
				} catch (error) {
					console.error(`[EventBus] Handler error for "${topic}":`, error);
					throw error;
				}
			}),
		);

		// Log failures
		const failures = results.filter((r) => r.status === 'rejected');
		if (failures.length > 0) {
			console.error(
				`[EventBus] ${failures.length}/${handlers.length} handlers failed for "${topic}"`,
			);
		}
	}

	/**
	 * Publish multiple events in batch
	 */
	async publishBatch<T>(
		events: Array<{ topic: string; payload: T; metadata?: Partial<IEventMetadata> }>,
	): Promise<void> {
		await Promise.all(
			events.map(({ topic, payload, metadata }) =>
				this.publish(topic, payload, metadata),
			),
		);
	}

	/**
	 * Check if topic has subscribers
	 */
	hasSubscribers(topic: string): boolean {
		return this.getSubscriberCount(topic) > 0;
	}

	/**
	 * Get subscriber count for topic
	 */
	getSubscriberCount(topic: string): number {
		return this.getMatchingHandlers(topic).length;
	}

	/**
	 * Clear all subscriptions
	 */
	clear(): void {
		this.subscriptions.clear();
		this.patternSubscriptions.clear();
	}

	/**
	 * Get all matching handlers for a topic (including pattern matches)
	 */
	private getMatchingHandlers(topic: string): Subscription[] {
		const handlers: Subscription[] = [];

		// Exact match subscriptions
		const exactSubs = this.subscriptions.get(topic);
		if (exactSubs) {
			handlers.push(...exactSubs);
		}

		// Pattern match subscriptions
		for (const [pattern, subs] of this.patternSubscriptions) {
			if (this.matchPattern(pattern, topic)) {
				handlers.push(...subs);
			}
		}

		return handlers;
	}

	/**
	 * Match topic against pattern
	 * Supports wildcards:
	 * - '*' matches exactly one segment
	 * - '#' matches zero or more segments
	 *
	 * Examples:
	 * - 'user.*' matches 'user.created', 'user.updated'
	 * - 'user.#' matches 'user.created', 'user.profile.updated'
	 */
	private matchPattern(pattern: string, topic: string): boolean {
		const patternParts = pattern.split('.');
		const topicParts = topic.split('.');

		let patternIdx = 0;
		let topicIdx = 0;

		while (patternIdx < patternParts.length && topicIdx < topicParts.length) {
			const patternPart = patternParts[patternIdx];

			if (patternPart === '#') {
				// '#' matches zero or more segments
				if (patternIdx === patternParts.length - 1) {
					return true;
				}
				// Try to match remaining pattern
				while (topicIdx < topicParts.length) {
					if (
						this.matchPattern(
							patternParts.slice(patternIdx + 1).join('.'),
							topicParts.slice(topicIdx).join('.'),
						)
					) {
						return true;
					}
					topicIdx++;
				}
				return false;
			}

			if (patternPart !== '*' && patternPart !== topicParts[topicIdx]) {
				return false;
			}

			patternIdx++;
			topicIdx++;
		}

		return patternIdx === patternParts.length && topicIdx === topicParts.length;
	}

	/**
	 * Execute handler with retry logic
	 */
	private async executeHandler<T>(
		handler: EventHandler<T>,
		event: IEvent<T>,
		options?: ISubscriptionOptions,
	): Promise<void> {
		const maxRetries = options?.retry?.maxRetries ?? 0;
		const backoffMs = options?.retry?.backoffMs ?? 1000;
		const exponential = options?.retry?.exponential ?? true;

		let lastError: Error | undefined;

		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				await handler(event);
				return;
			} catch (error) {
				lastError = error as Error;
				console.error(
					`[EventBus] Handler failed for "${event.type}" (attempt ${attempt + 1}/${maxRetries + 1}):`,
					error,
				);

				if (attempt < maxRetries) {
					const delay = exponential
						? backoffMs * Math.pow(2, attempt)
						: backoffMs;
					await this.sleep(delay);
				}
			}
		}

		throw lastError;
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

// Export singleton instance
export const eventBus = InMemoryEventBus.getInstance();
