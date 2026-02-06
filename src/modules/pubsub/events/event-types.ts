/**
 * ============================================================================
 * ĐỊNH NGHĨA TẤT CẢ EVENT TYPES TRONG HỆ THỐNG
 * ============================================================================
 *
 * Tập trung định nghĩa tất cả events giúp:
 * - Type safety khi publish/subscribe
 * - Documentation cho team
 * - Dễ dàng trace event flow
 * - Schema validation
 */

// ============================================================================
// USER EVENTS
// ============================================================================

export const USER_EVENTS = {
	CREATED: 'user.created',
	UPDATED: 'user.updated',
	DELETED: 'user.deleted',
	LOGGED_IN: 'user.logged_in',
	LOGGED_OUT: 'user.logged_out',
	PASSWORD_CHANGED: 'user.password_changed',
	PASSWORD_RESET_REQUESTED: 'user.password_reset_requested',
	EMAIL_VERIFIED: 'user.email_verified',
	PROFILE_UPDATED: 'user.profile_updated',
	ROLE_CHANGED: 'user.role_changed',
} as const;

export type UserEventType = (typeof USER_EVENTS)[keyof typeof USER_EVENTS];

export interface UserCreatedPayload {
	userId: string;
	email: string;
	username?: string;
	createdAt: Date;
}

export interface UserUpdatedPayload {
	userId: string;
	changes: Record<string, unknown>;
	updatedAt: Date;
}

export interface UserLoggedInPayload {
	userId: string;
	ip?: string;
	userAgent?: string;
	loginAt: Date;
}

// ============================================================================
// PROJECT EVENTS
// ============================================================================

export const PROJECT_EVENTS = {
	CREATED: 'project.created',
	UPDATED: 'project.updated',
	DELETED: 'project.deleted',
	MEMBER_ADDED: 'project.member_added',
	MEMBER_REMOVED: 'project.member_removed',
	MEMBER_ROLE_CHANGED: 'project.member_role_changed',
	STATUS_CHANGED: 'project.status_changed',
} as const;

export type ProjectEventType = (typeof PROJECT_EVENTS)[keyof typeof PROJECT_EVENTS];

export interface ProjectCreatedPayload {
	projectId: string;
	name: string;
	ownerId: string;
	createdAt: Date;
}

export interface ProjectMemberAddedPayload {
	projectId: string;
	userId: string;
	role: string;
	addedBy: string;
	addedAt: Date;
}

// ============================================================================
// NOTIFICATION EVENTS
// ============================================================================

export const NOTIFICATION_EVENTS = {
	CREATED: 'notification.created',
	SENT: 'notification.sent',
	READ: 'notification.read',
	BULK_SEND: 'notification.bulk_send',
} as const;

export type NotificationEventType =
	(typeof NOTIFICATION_EVENTS)[keyof typeof NOTIFICATION_EVENTS];

export interface NotificationCreatedPayload {
	notificationId: string;
	userId: string;
	type: string;
	title: string;
	message: string;
	data?: Record<string, unknown>;
}

// ============================================================================
// EMAIL EVENTS
// ============================================================================

export const EMAIL_EVENTS = {
	SEND_REQUESTED: 'email.send_requested',
	SENT: 'email.sent',
	FAILED: 'email.failed',
	BOUNCED: 'email.bounced',
} as const;

export type EmailEventType = (typeof EMAIL_EVENTS)[keyof typeof EMAIL_EVENTS];

export interface EmailSendRequestedPayload {
	to: string | string[];
	subject: string;
	template: string;
	templateData?: Record<string, unknown>;
	priority?: 'low' | 'normal' | 'high';
}

// ============================================================================
// PAYMENT EVENTS (VNPay integration)
// ============================================================================

export const PAYMENT_EVENTS = {
	INITIATED: 'payment.initiated',
	COMPLETED: 'payment.completed',
	FAILED: 'payment.failed',
	REFUNDED: 'payment.refunded',
	CALLBACK_RECEIVED: 'payment.callback_received',
} as const;

export type PaymentEventType = (typeof PAYMENT_EVENTS)[keyof typeof PAYMENT_EVENTS];

export interface PaymentCompletedPayload {
	transactionId: string;
	userId: string;
	amount: number;
	currency: string;
	method: string;
	completedAt: Date;
}

// ============================================================================
// CACHE EVENTS
// ============================================================================

export const CACHE_EVENTS = {
	INVALIDATED: 'cache.invalidated',
	WARMED: 'cache.warmed',
	KEY_EXPIRED: 'cache.key_expired',
} as const;

export type CacheEventType = (typeof CACHE_EVENTS)[keyof typeof CACHE_EVENTS];

export interface CacheInvalidatedPayload {
	keys: string[];
	pattern?: string;
	reason: string;
}

// ============================================================================
// SYSTEM EVENTS
// ============================================================================

export const SYSTEM_EVENTS = {
	ERROR_OCCURRED: 'system.error_occurred',
	MAINTENANCE_STARTED: 'system.maintenance_started',
	MAINTENANCE_ENDED: 'system.maintenance_ended',
	CONFIG_UPDATED: 'system.config_updated',
} as const;

export type SystemEventType = (typeof SYSTEM_EVENTS)[keyof typeof SYSTEM_EVENTS];

// ============================================================================
// ALL EVENTS COMBINED
// ============================================================================

export const ALL_EVENTS = {
	...USER_EVENTS,
	...PROJECT_EVENTS,
	...NOTIFICATION_EVENTS,
	...EMAIL_EVENTS,
	...PAYMENT_EVENTS,
	...CACHE_EVENTS,
	...SYSTEM_EVENTS,
} as const;

export type AllEventTypes =
	| UserEventType
	| ProjectEventType
	| NotificationEventType
	| EmailEventType
	| PaymentEventType
	| CacheEventType
	| SystemEventType;
