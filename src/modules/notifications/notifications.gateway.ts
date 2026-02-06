import { Server as HTTPServer } from 'http';

import { Server, Socket } from 'socket.io';

import { UnauthorizedException } from '@/common';

export class NotificationsGateway {
	constructor(
		private socketServer: Server | null = null,
		private readonly connectedUsers = new Map<string, Set<string>>(),
		private readonly socketToUser = new Map<string, string>(),
	) {}

	initialize(httpServer: HTTPServer): void {
		console.log(
			`🚀 ~ notifications.gateway.ts:46 ~ NotificationsGateway ~ initialize ~ httpServer:`,
		);
		this.socketServer = new Server(httpServer, {
			cors: {
				origin: process.env.CORS_ORIGIN || '*',
				credentials: true,
			},
		});

		this.socketServer.use(async (socketClient: Socket, next) => {
			try {
				console.log('qua socket middlware');

				// const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

				// if (!token) {
				//     throw new UnauthorizedException('Authentication token required');
				// }

				// const payload = verify(token, jwtConfig.secretAccessToken) as ITokenPayload;

				socketClient.data.userId = '1234567890';

				next();
			} catch (error) {
				next(new UnauthorizedException());
			}
		});

		this.socketServer.on('connection', (socket) => this.handleConnection(socket));
	}

	private async handleConnection(socketClient: Socket): Promise<void> {
		try {
			console.log('qua socket connection');

			const userId = socketClient.data.userId;
			console.log(
				`🚀 ~ notifications.gateway.ts:48 ~ NotificationsGateway ~ handleConnection ~ userId:`,
				userId,
			);

			if (!userId) {
				socketClient.disconnect();
				return;
			}

			if (!this.connectedUsers.has(userId)) {
				this.connectedUsers.set(userId, new Set());
			}
			this.connectedUsers.get(userId)?.add(socketClient.id);
			this.socketToUser.set(socketClient.id, userId);

			socketClient.on('disconnect', () => this.handleDisconnect(socketClient));
		} catch (error) {
			socketClient.disconnect();
		}
	}

	private async handleDisconnect(socketClient: Socket): Promise<void> {
		try {
			console.log('qua socket disconnection');

			const userId = this.socketToUser.get(socketClient.id);

			if (userId) {
				const userSockets = this.connectedUsers.get(userId);

				if (userSockets) {
					userSockets.delete(socketClient.id);

					if (userSockets.size === 0) {
						this.connectedUsers.delete(userId);
					}
				}
			}

			this.socketToUser.delete(socketClient.id);
		} catch (error) {}
	}

	async sendNotificationToUser({
		userId,
		event,
		notification,
	}: {
		userId: string;
		event: string;
		notification: unknown;
	}): Promise<boolean> {
		try {
			if (!this.socketServer) {
				return false;
			}

			const userSockets = this.connectedUsers.get(userId);

			if (!userSockets || userSockets.size === 0) {
				return false;
			}

			userSockets.forEach((socketId) => {
				this.socketServer?.to(socketId).emit(event, notification);
			});

			return true;
		} catch (error) {
			return false;
		}
	}

	async broadcastNotification(event: string, notification: unknown): Promise<boolean> {
		try {
			if (!this.socketServer) {
				return false;
			}

			this.socketServer.emit(event, notification);
			return true;
		} catch (error) {
			return false;
		}
	}

	async sendNotificationToMultipleUsers({
		userIds,
		event,
		notification,
	}: {
		userIds: string[];
		event: string;
		notification: unknown;
	}): Promise<boolean> {
		try {
			const promises = userIds.map((userId) =>
				this.sendNotificationToUser({
					userId: userId,
					event: event,
					notification: notification,
				}),
			);

			await Promise.all(promises);
			return true;
		} catch (error) {
			return false;
		}
	}

	async getOnlineUsersCount(): Promise<number> {
		try {
			return this.connectedUsers.size;
		} catch (error) {
			return 0;
		}
	}
}

export default new NotificationsGateway();
