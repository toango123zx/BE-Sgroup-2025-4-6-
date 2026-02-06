import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { NotificationsController } from './notifications.controller';

import { autoBindUtil } from '@/common';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

const notificationsController = new NotificationsController();

export const notificationsRegistry = new OpenAPIRegistry();

const router = Router({ mergeParams: true });
autoBindUtil(notificationsController);

notificationsRegistry.registerPath({
	method: 'get',
	path: '/notifications',
	tags: ['Notifications'],
	responses: createApiResponse(null, 'Success', StatusCodes.OK),
});
router.get('/', notificationsController.getNotifications);

notificationsRegistry.registerPath({
	method: 'get',
	path: '/notifications/test-connect',
	tags: ['Notifications'],
	responses: createApiResponse(null, 'Success', StatusCodes.OK),
});
router.get('/test-connect', notificationsController.testConnected);

export const notificationsRouter = router;
