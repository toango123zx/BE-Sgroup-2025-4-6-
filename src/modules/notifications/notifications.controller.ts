import { Exception } from '@tsed/exceptions';
import { Request, Response } from 'express';

import { NotificationsService } from './notifications.service';

import { HttpResponseDto } from '@/common';

export class NotificationsController {
	constructor(private readonly notificationsService = new NotificationsService()) {}

	async getNotifications(req: Request): Promise<Response> {
		const result = await this.notificationsService.getNotifications();
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}

	async testConnected(req: Request): Promise<Response> {
		const result = await this.notificationsService.testConnected();
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}
}
