/**
 * Pub/Sub Pattern Interfaces
 *
 * ============================================================================
 * ĐỊNH NGHĨA CƠ BẢN
 * ============================================================================
 *
 * Pub/Sub (Publish/Subscribe) là pattern cho phép:
 * - Publishers: Gửi messages mà không cần biết ai sẽ nhận
 * - Subscribers: Đăng ký nhận messages theo topics mà không cần biết ai gửi
 * - Decoupling: Publisher và Subscriber không biết nhau, giao tiếp qua broker
 *
 * ============================================================================
 * KHI NÀO CẦN SỬ DỤNG PUB/SUB?
 * ============================================================================
 *
 * 1. Event-Driven Architecture:
 *    - Khi một action cần trigger nhiều side effects (gửi email, log, cache, notification)
 *    - Ví dụ: User đăng ký -> gửi welcome email, tạo profile mặc định, log analytics
 *
 * 2. Microservices Communication:
 *    - Services cần giao tiếp loosely coupled
 *    - Không muốn service A phải biết và gọi trực tiếp service B, C, D
 *
 * 3. Real-time Updates:
 *    - Push notifications đến nhiều clients
 *    - Live updates (dashboard, chat, collaboration tools)
 *
 * 4. Async Processing:
 *    - Background jobs không block main request
 *    - Task queue processing
 *
 * 5. System Scaling:
 *    - Khi cần xử lý nhiều requests đồng thời
 *    - Load balancing giữa multiple workers
 *
 * ============================================================================
 * ƯU ĐIỂM
 * ============================================================================
 *
 * ✅ Loose Coupling: Publisher không cần biết Subscriber
 * ✅ Scalability: Dễ dàng thêm subscribers mới
 * ✅ Flexibility: Thay đổi logic mà không ảnh hưởng các phần khác
 * ✅ Async Processing: Non-blocking operations
 * ✅ Event Replay: Có thể replay events (nếu persist)
 * ✅ Testability: Dễ mock và test isolated
 *
 * ============================================================================
 * NHƯỢC ĐIỂM
 * ============================================================================
 *
 * ❌ Complexity: Thêm layer abstraction
 * ❌ Message Ordering: Khó đảm bảo thứ tự (cần partition key)
 * ❌ Debugging: Khó trace message flow
 * ❌ Eventual Consistency: Data có thể không consistent ngay lập tức
 * ❌ Error Handling: Phức tạp hơn (retry, dead letter queue)
 * ❌ Latency: Thêm overhead so với direct call
 *
 */

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Event base interface - tất cả events phải extend từ đây
 */
export interface IEvent<T = unknown> {
	/** Unique identifier for event */
	id: string;

	/** Event type/topic name */
	type: string;

	/** Event payload data */
	payload: T;

	/** Timestamp when event was created */
	timestamp: Date;

	/** Optional metadata */
	metadata?: IEventMetadata;
}

export interface IEventMetadata {
	/** User ID who triggered the event */
	userId?: string;

	/** Correlation ID for tracing */
	correlationId?: string;

	/** Source service/module */
	source?: string;

	/** Event version for schema evolution */
	version?: string;

	/** Priority level */
	priority?: 'low' | 'normal' | 'high' | 'critical';

	/** Retry count */
	retryCount?: number;

	/** Max retries allowed */
	maxRetries?: number;
}

/**
 * Event handler type
 */
export type EventHandler<T = unknown> = (event: IEvent<T>) => Promise<void> | void;

/**
 * Subscription options
 */
export interface ISubscriptionOptions {
	/** Pattern matching for topics (e.g., 'user.*', 'order.created') */
	pattern?: boolean;

	/** Only receive events from specific sources */
	filterBySources?: string[];

	/** Retry configuration */
	retry?: {
		maxRetries: number;
		backoffMs: number;
		exponential?: boolean;
	};

	/** Acknowledge mode */
	ackMode?: 'auto' | 'manual';

	/** Batch processing */
	batch?: {
		size: number;
		timeoutMs: number;
	};
}

/**
 * Publisher interface
 */
export interface IPublisher {
	/**
	 * Publish an event to a topic
	 */
	publish<T>(
		topic: string,
		payload: T,
		metadata?: Partial<IEventMetadata>,
	): Promise<void>;

	/**
	 * Publish multiple events
	 */
	publishBatch<T>(
		events: Array<{ topic: string; payload: T; metadata?: Partial<IEventMetadata> }>,
	): Promise<void>;
}

/**
 * Subscriber interface
 */
export interface ISubscriber {
	/**
	 * Subscribe to a topic
	 */
	subscribe<T>(
		topic: string,
		handler: EventHandler<T>,
		options?: ISubscriptionOptions,
	): void;

	/**
	 * Unsubscribe from a topic
	 */
	unsubscribe(topic: string, handler?: EventHandler): void;

	/**
	 * Unsubscribe all handlers
	 */
	unsubscribeAll(): void;
}

/**
 * Event Bus interface - combines Publisher and Subscriber
 */
export interface IEventBus extends IPublisher, ISubscriber {
	/**
	 * Check if topic has subscribers
	 */
	hasSubscribers(topic: string): boolean;

	/**
	 * Get subscriber count for topic
	 */
	getSubscriberCount(topic: string): number;

	/**
	 * Clear all subscriptions
	 */
	clear(): void;
}

/**
 * Distributed Event Bus interface - for multi-instance scenarios
 */
export interface IDistributedEventBus extends IEventBus {
	/**
	 * Connect to message broker
	 */
	connect(): Promise<void>;

	/**
	 * Disconnect from message broker
	 */
	disconnect(): Promise<void>;

	/**
	 * Check connection status
	 */
	isConnected(): boolean;
}
