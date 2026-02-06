import { UserStatusEnum } from '@prisma/client';
import { ClientException, Exception } from '@tsed/exceptions';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JsonWebTokenError, TokenExpiredError, verify } from 'jsonwebtoken';

import { UsersRepository } from '@/modules/users/users.repository';

import {
	InternalServerException,
	OptionalException,
	UnauthorizedException,
} from '../exceptions';
import { ITokenPayload } from '../interfaces';

import { BaseAutoBindMiddleware } from './baseAutoBindmiddleware';

import { jwtConfig } from '@/configs';
import { UserInformationDto } from '@/modules/users/dtos';

class AuthMiddleware extends BaseAutoBindMiddleware {
	constructor(
		private readonly userRepository = new UsersRepository(),
		private readonly permissionRepository = new UsersRepository(),
	) {
		super();
	}

	async verifyAccessToken(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void | Exception> {
		const cookies = req.headers.cookie;
		const accessToken = cookies
			?.split('; ')
			.find((row) => row.startsWith('accessToken='))
			?.split('=')[1];
		let user: UserInformationDto;

		if (!accessToken) {
			throw new UnauthorizedException();
		}

		try {
			const payload: ITokenPayload = verify(
				accessToken,
				jwtConfig.secretAccessToken,
			) as ITokenPayload;
			const userData = await this.userRepository.findUser({
				userId: payload.userId,
				userStatus: UserStatusEnum.ACTIVE,
			});
			if (!userData) {
				throw new UnauthorizedException();
			}

			user = new UserInformationDto(userData);

			req.user = user;
		} catch (error) {
			if (error instanceof TokenExpiredError) {
				throw new OptionalException(StatusCodes.UNAUTHORIZED, error.message);
			}
			if (error instanceof JsonWebTokenError) {
				throw new UnauthorizedException(error.message);
			}
			throw new InternalServerException();
		}

		next();
	}

	async verifyRefreshToken(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void | Exception> {
		const cookies = req.headers.cookie;
		const accessToken = cookies
			?.split('; ')
			.find((row) => row.startsWith('accessToken='))
			?.split('=')[1];
		const refreshToken = cookies
			?.split('; ')
			.find((row) => row.startsWith('refreshToken='))
			?.split('=')[1];
		let user: UserInformationDto;

		if (!refreshToken || !accessToken) {
			throw new UnauthorizedException();
		}
		try {
			const payloadRefreshToken: ITokenPayload = verify(
				refreshToken,
				jwtConfig.secretRefreshToken,
			) as ITokenPayload;
			const payloadAccessToken: ITokenPayload = verify(
				accessToken,
				jwtConfig.secretAccessToken,
				{
					ignoreExpiration: true,
				},
			) as ITokenPayload;

			if (payloadAccessToken.exp > Date.now() / 1000) {
				throw new OptionalException(
					StatusCodes.CONFLICT,
					'Access token has not expired yet',
				);
			}

			const userData = await this.userRepository.findUser({
				userId: payloadRefreshToken.userId,
				userStatus: UserStatusEnum.ACTIVE,
			});
			if (!userData) {
				throw new UnauthorizedException();
			}

			user = new UserInformationDto(userData);

			req.user = user;
		} catch (error) {
			if (error instanceof TokenExpiredError) {
				throw new OptionalException(StatusCodes.UNAUTHORIZED, error.message);
			}
			if (error instanceof JsonWebTokenError) {
				throw new UnauthorizedException(error.message);
			}
			if (error instanceof ClientException) {
				throw error;
			}
		}

		next();
	}

	// permission chung he thong: user -> role_user -> role -> role_permission -> permission
	/**
	 *
	 * @param req
	 * @param res
	 * @param next
	 *
	 * Đầu vào
	 * Thông tin user
	 * Permission cần
	 *
	 * Logic
	 * Lấy danh sách permission của user từ database (userId)
	 * Kiểm tra permission cần cho API nó có trong permission của user hay không
	 *
	 * Đầu ra
	 * Có, next()
	 * Không, throw error
	 */
	verifyPermission(permission: string) {
		return async (req: Request, res: Response, next: NextFunction) => {
			const user = req.user as UserInformationDto;
			permission;

			// Lấy danh sách permission của user
			// tao 1 ham trong permission query thong qua role_user
			// hoac lay role truoc roi moi lay permission

			next();
		};
	}

	//verify role cua project: user -> project_member -> role -> role_permission -> permission
}

export default new AuthMiddleware();
