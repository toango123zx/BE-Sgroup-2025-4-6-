import { Prisma, users } from '@prisma/client';
import { Exception } from '@tsed/exceptions';
import { genSalt, hash } from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { VnpLocale, dateFormat } from 'vnpay';

import { AuthRepository } from '../auth/auth.repository';

import {
	GetUserByUserIdRequestDto,
	GetUserResponseDto,
	GetUsersRequestDto,
	GetUsersResponseDto,
	UpdateMyInformationRequestDto,
	UpdateMyPasswordRequestDto,
	UserInformationDto,
} from './dtos';
import { UsersRepository } from './users.repository';

import {
	HttpResponseBodySuccessDto,
	NotFoundException,
	ObjectComparerDto,
	OptionalException,
	PaginationDto,
	PaginationUtils,
} from '@/common';
import { geminiModel } from '@/configs';
import { vnpay } from '@/configs/vnpay.config';
import { RedisCache, RedisPublisher, RedisSubscriber } from '@/infrastructure';

export class UsersService {
	constructor(
		private readonly authRepository: AuthRepository = new AuthRepository(),
		private readonly usersRepository: UsersRepository = new UsersRepository(),
		private readonly redisCache = new RedisCache(),
		private readonly redisPublisher = new RedisPublisher(),
		private readonly redisSubscriber = new RedisSubscriber(),
	) {}

	async getUsers(
		getUsersRequest: GetUsersRequestDto,
		pagination: PaginationDto,
	): Promise<HttpResponseBodySuccessDto<GetUsersResponseDto[]>> {
		const { name, status } = getUsersRequest;
		const paginationUtils = new PaginationUtils().extractSkipTakeFromPagination(
			pagination,
		);
		const [users, totalUsers] = await this.usersRepository.findUsers({
			name: name,
			status: status,
			skip: 1,
			take: 10,
		});

		const userResponse = users.map((user) => new GetUsersResponseDto(user));
		return {
			success: true,
			data: userResponse,
			pagination:
				paginationUtils.convertPaginationResponseDtoFromTotalRecords(totalUsers),
		};
	}

	async getUserByUserId(
		getUserByUserIdRequestDto: GetUserByUserIdRequestDto,
	): Promise<HttpResponseBodySuccessDto<GetUserResponseDto>> {
		const { userId, status } = getUserByUserIdRequestDto;
		const user = await this.usersRepository.findUser({
			userId: userId,
			userStatus: status,
		});

		if (!user) {
			throw new NotFoundException('userId');
		}

		return {
			success: true,
			data: new GetUserResponseDto(user),
		};
	}

	async getMyInformation(
		myInformationDto: UserInformationDto,
	): Promise<HttpResponseBodySuccessDto<GetUserResponseDto>> {
		return {
			success: true,
			data: new GetUserResponseDto(myInformationDto),
		};
	}

	async updateMyInformation(
		updateMyInformationRequestDto: UpdateMyInformationRequestDto,
		myInformationDto: UserInformationDto,
	): Promise<HttpResponseBodySuccessDto<GetUserResponseDto> | Exception> {
		const updateUserData = new ObjectComparerDto<users>(
			myInformationDto,
		).getUpdatedFields<Prisma.usersUpdateManyMutationInput>(
			updateMyInformationRequestDto,
		);
		if (Object.keys(updateUserData).length === 0) {
			return new OptionalException(
				StatusCodes.UNPROCESSABLE_ENTITY,
				'No fields to update',
			);
		}

		const updatedUser = await this.usersRepository.updateUser({
			userId: myInformationDto.id,
			user: updateUserData,
		});

		return {
			success: true,
			data: new GetUserResponseDto(updatedUser),
		};
	}

	async updateMyPassword(
		updateMyPasswordRequestDto: UpdateMyPasswordRequestDto,
		myInformationDto: UserInformationDto,
	): Promise<HttpResponseBodySuccessDto<GetUserResponseDto> | Exception> {
		const { newPassword } = updateMyPasswordRequestDto;
		const account = await this.authRepository.findAccount({
			userId: myInformationDto.id,
			email: myInformationDto.email,
		});

		const salt = await genSalt(10);
		const hashedPassword = await hash(newPassword, salt);

		if (!account) {
			const account: Prisma.accountsCreateInput = {
				salt: salt,
				password: hashedPassword,
				user: {
					connect: {
						id: myInformationDto.id,
					},
				},
			};

			await this.authRepository.createAccount({
				accounts: account,
			});
		}

		await this.authRepository.updatePassword({
			userId: myInformationDto.id,
			salt: salt,
			password: hashedPassword,
		});

		return {
			success: true,
			data: new GetUserResponseDto(myInformationDto),
		};
	}

	async createBill(): Promise<HttpResponseBodySuccessDto<string>> {
		const paymentUrl = vnpay.buildPaymentUrl({
			vnp_Amount: 10000 * 100, // Số tiền thanh toán: 10000 VND
			vnp_IpAddr: '127.0.0.1',
			vnp_TxnRef: 'sadadsadasdas',
			vnp_OrderInfo: `Pay order 1 with the amount of ${10000}.`,
			vnp_ReturnUrl: `http://127.0.0.1:3000/transaction/vnpay-bill-payment`,
			vnp_Locale: VnpLocale.VN,
			vnp_CreateDate: dateFormat(new Date()),
			// vnp_ExpireDate: dateFormat(expireDate),
		});
		console.log(
			`🚀 ~ users.service.ts:168 ~ UsersService ~ createBill ~ paymentUrl:`,
			paymentUrl,
		);
		return {
			success: true,
			data: 'a',
		};
	}

	async testAddKeyRedis(): Promise<HttpResponseBodySuccessDto<string>> {
		// // await this.resdisService.set('a', 123456789);
		// // const a = Number(await this.resdisService.get('a'));
		// console.log(`🚀 ~ users.service.ts:178 ~ UsersService ~ testAddKeyRedis ~ a:`, a)
		// console.log(`🚀 ~ users.service.ts:178 ~ UsersService ~ testAddKeyRedis ~ a:`, typeof (a));}
		const request = 'Tạo 1 plan với việc phát triển ứng dụng trello theo scrum';
		const prompt = `ai trò của bạn: Bạn là Business Analyst trong một dự án phần mềm.
Nhiệm vụ của bạn là phân tích yêu cầu tôi cung cấp và chuyển nó thành một task kỹ thuật rõ ràng cho team dev.

BẮT BUỘC:

Chỉ được trả về JSON hợp lệ

Không giải thích thêm ngoài JSON

Không thêm text trước hoặc sau JSON

Viết chi tiết, rõ ràng, theo tư duy hệ thống

Cấu trúc JSON phải đúng như sau:

{
  "ten_task": "",
  "user_story": "",
  "chi_tiet": "",
  "yeu_cau": [],
  "chu_y": "",
  "request_api": {
    "method": "",
    "url": "",
    "headers": {},
    "body": {}
  },
  "response": {
    "success": {},
    "error": {}
  }
}


Mô tả từng field:

ten_task: Tên ngắn gọn của task theo kiểu dev hiểu

user_story: Viết theo format As a … I want … So that …

chi_tiet: Mô tả nghiệp vụ đầy đủ

yeu_cau: Danh sách các yêu cầu hệ thống (array)

chu_y: Edge cases, validate, bảo mật, logic đặc biệt

request_api: Cấu trúc request frontend gửi lên backend

response.success: Ví dụ response khi thành công

response.error: Các trường hợp lỗi có thể xảy ra`;
		const response = await geminiModel.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: prompt + '\n\n' + request,
		});
		console.log(response.text);
		return {
			success: true,
			data: String(response.text),
		};
	}

	async testSetKeyRedis(): Promise<HttpResponseBodySuccessDto<string>> {
		await this.redisCache.set('myKey', 'myValue');
		return {
			success: true,
			data: 'Published message to Redis channel "news".',
		};
	}

	async testGetKeyRedis(): Promise<HttpResponseBodySuccessDto<string | null>> {
		const value = await this.redisCache.get('myKey');
		return {
			success: true,
			data: value,
		};
	}

	async testRedisPublish(): Promise<HttpResponseBodySuccessDto<string>> {
		await this.redisPublisher.publish({
			channel: 'news',
			payload: 'Hello, Redis!',
		});
		return {
			success: true,
			data: 'Published message to Redis channel "news".',
		};
	}

	async testRedisSubscribe(): Promise<HttpResponseBodySuccessDto<string>> {
		console.log('haha');

		await this.redisSubscriber.subscribe({
			channel: 'news',
			handler: async (message: string) => {
				console.log(`Received message from Redis channel 'news': ${message}`);
			},
		});
		return {
			success: true,
			data: 'Subscribed to Redis channel "news".',
		};
	}
}
