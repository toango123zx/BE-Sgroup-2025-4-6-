import { Exception } from '@tsed/exceptions';
import { Request, Response } from 'express';

import {
	GetUserByUserIdRequestDto,
	GetUserResponseDto,
	GetUsersRequestDto,
	GetUsersResponseDto,
	UpdateMyInformationRequestDto,
	UpdateMyPasswordRequestDto,
	UserInformationDto,
} from './dtos';
import { UsersService } from './users.service';

import { HttpResponseDto, PaginationDto } from '@/common';

export class UsersController {
	constructor(private readonly usersService: UsersService = new UsersService()) {}

	async getUsers(req: Request): Promise<Response> {
		const getUsersRequest: GetUsersRequestDto = new GetUsersRequestDto(req.query);
		const pagination: PaginationDto = new PaginationDto(req.query);

		const result = await this.usersService.getUsers(getUsersRequest, pagination);
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<GetUsersResponseDto[]>(result);
	}

	async getUserByUserId(req: Request): Promise<Response> {
		const { userId } = req.params;

		const getUserByUserIdRequestDto = new GetUserByUserIdRequestDto(
			userId,
			req.query,
		);

		const result = await this.usersService.getUserByUserId(getUserByUserIdRequestDto);
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<GetUserResponseDto>(result);
	}

	async getMyInformation(req: Request): Promise<Response> {
		const myInformationDto = req.user as UserInformationDto;
		const result = await this.usersService.getMyInformation(myInformationDto);
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<GetUserResponseDto>(result);
	}

	async updateMyInformation(req: Request): Promise<Response> {
		const updateMyInformationRequestDto = new UpdateMyInformationRequestDto(
			req.query,
		);
		const myInformationDto = req.user as UserInformationDto;
		const result = await this.usersService.updateMyInformation(
			updateMyInformationRequestDto,
			myInformationDto,
		);
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<GetUserResponseDto>(result);
	}

	async updateMyPassword(req: Request): Promise<Response> {
		const updateMyPasswordRequestDto = new UpdateMyPasswordRequestDto(req.body);
		const myInformationDto = req.user as UserInformationDto;
		const result = await this.usersService.updateMyPassword(
			updateMyPasswordRequestDto,
			myInformationDto,
		);
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<GetUserResponseDto>(result);
	}

	async createBill(req: Request): Promise<Response> {
		const result = await this.usersService.createBill();
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<string>(result);
	}

	async testAddKeyRedis(req: Request): Promise<Response> {
		// const a =  new NotFoundException();
		// return new HttpResponseDto().exception(a);
		const result = await this.usersService.testAddKeyRedis();
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<string>(result);
	}

	async testSetKeyRedis(req: Request): Promise<Response> {
		// const a =  new NotFoundException();
		// return new HttpResponseDto().exception(a);
		const result = await this.usersService.testSetKeyRedis();
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<string>(result);
	}

	async testGetKeyRedis(req: Request): Promise<Response> {
		// const a =  new NotFoundException();
		// return new HttpResponseDto().exception(a);
		const result = await this.usersService.testGetKeyRedis();
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<string>(result);
	}

	async testRedisPublish(req: Request): Promise<Response> {
		// const a =  new NotFoundException();
		// return new HttpResponseDto().exception(a);
		const result = await this.usersService.testRedisPublish();
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<string>(result);
	}

	async testRedisSubscribe(req: Request): Promise<Response> {
		// const a =  new NotFoundException();
		// return new HttpResponseDto().exception(a);
		const result = await this.usersService.testRedisSubscribe();
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<string>(result);
	}
}
