import { Exception } from '@tsed/exceptions';
import io from 'socket.io-client';

import NotificationsGateway from './notifications.gateway';

import { HttpResponseBodySuccessDto } from '@/common';

export class NotificationsService {
	constructor(private readonly notificationsGateway = NotificationsGateway) {}

	async getNotifications(): Promise<HttpResponseBodySuccessDto<any> | Exception> {
		console.log(
			`🚀 ~ notifications.service.ts:8 ~ NotificationsService ~ constructor ~ notificationsGateway:`,
			await this.notificationsGateway.getOnlineUsersCount(),
		);
		console.log('asdhskj');

		return {
			success: true,
			data: 'Notifications service is running',
		};
	}

	async testConnected(): Promise<HttpResponseBodySuccessDto<any> | Exception> {
		const socket = io('http://localhost:3000', {
			transports: ['websocket', 'polling'],
			withCredentials: true,
			timeout: 20000,
			forceNew: true,
		});

		socket.on('connect', () => {
			console.log('Socket connected:', socket.id);
		});

		return {
			success: true,
			data: 'Notifications service is running',
		};
	}
}
