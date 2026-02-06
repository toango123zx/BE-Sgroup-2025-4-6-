# Backend Project - Quy Ước Cấu Trúc và Đặt Tên

## Mục Lục

1. [Tổng Quan Dự Án](#tổng-quan-dự-án)
2. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
3. [Quy Ước Đặt Tên](#quy-ước-đặt-tên)
4. [Chi Tiết Các Thư Mục](#chi-tiết-các-thư-mục)
5. [Quy Ước Code](#quy-ước-code)

---

## Tổng Quan Dự Án

Dự án Backend được xây dựng với:

- **Framework**: Express.js + TypeScript
- **ORM**: Prisma
- **DI Container**: TSyringe
- **Validation**: Zod + Class Validator
- **Testing**: Jest
- **Documentation**: OpenAPI/Swagger
- **Package Manager**: pnpm

---

## Cấu Trúc Thư Mục

```
BE/                                         # Thư mục gốc của dự án Backend
│
├── prisma/                                 # 📊 QUẢN LÝ DATABASE (PRISMAORM)
│   └── schema.prisma                       # File Cấu hình database provider, định nghĩa schema database (tables, relations, indexes)
│
├── src/                                    # 📁 MÃ NGUỒN CHÍNH CỦA ỨNG DỤNG
│   │
│   ├── app.ts                              # 🚀 Khởi tạo Express server (config middlewares [cors, helmet, morgan, error handler...], register routes,... )
│   │
│   ├── common/                             # 🔧 Chứa các thành phần được tái sử dụng xuyên suốt dự án
│   │   ├── dtos/                           # Định nghĩa cấu trúc dữ liệu (Các class dùng chung, định dạng dữ liệu truyền giữa layers, Validate input/output data,... )
│   │   ├── enums/                          # Định nghĩa các hằng số có giá trị cố định
│   │   ├── exceptions/                     # Định nghĩa các lỗi đã được tùy chỉnh
│   │   ├── interfaces/                     # Định nghĩa các interface (cấu trúc đối tượng)
│   │   ├── middlewares/                    # Các xử lý trung gian (middleware)
│   │   └── utils/                          # Các hàm tiện ích, bổ trợ
│   │
│   ├── configs/                            # ⚙️ Cấu hình các thành phần cần thiết cho ứng dụng (cấu hình, đọc biến .env)
│   │
│   ├── models/                             # 🗄️ Các model được tạo từ shema của PrismaORM
│   │
│   ├── modules/                            # 🧩 Mỗi module là 1 feature hoàn chỉnh
│   │   ├── auth/                           # 🔐 1 Module cụ thể
│   │   │   ├── dtos/                       # DTOs riêng cho mỗi module
│   │   │   │   ├── requests/               # Chứa các class, interface định nghĩa data gửi đến server từ client (class, interface, shema của zod, shema của validation)
│   │   │   │   └── responses/              # Chứa các class, interface định nghĩa data trả về từ server cho client (class, interface, shema của zod)
│   │   │   │
│   │   │   ├── auth.router.ts              # 🛣️ Định nghĩa API routes
│   │   │   ├── auth.controller.ts          # 🎮 Xử lý HTTP requests, Nhận request từ client
│   │   │   ├── auth.service.ts             # 💼 Xử lý Business Logic (các nghiệp vụ chính) của API và Transform data trước khi trả về
│   │   │   └── auth.repository.ts          # 🗃️ Tương tác trực tiếp với Database
│   │   │
│   │   ├── .../                          # 👤 Module khác
│   │   │
│   │   └── index.ts                        # 📦 Export tất cả modules
│   │
│   └── swagger/                            # 📚 API DOCUMENTATION (OpenAPI/Swagger)
│       ├── openAPIDocumentGenerator.ts     # Generate OpenAPI spec từ code
│       ├── openAPIResponseBuilders.ts      # Build response schemas cho docs
│       ├── openAPIRouter.ts                # Router serve Swagger UI
│       └── constants.ts                    # Constants cho Swagger config
│
├── tests/                                  # 🧪 Kiểm thử ứng dụng
│   ├── __mocks__/                          # Mock Data & Services
│   └── unit/                               # Unit Tests - Test từng đơn vị nhỏ
│
├── .env                                    # 🔐 Chứa biến môi trường của ứng dụng
├── .env.example                            # 📝 Template cho .env, chứa các tham số cần config trong .env
├── .gitignore                              # 🚫 GIT IGNORE
├── .prettierrc                             # 💅 Cấu hình format code tự động bằng prettirer
├── docker-compose.yml                      # 🐳 DOCKER COMPOSE
├── dockerfile                              # 🐋 DOCKER IMAGE
├── eslint.config.js                        # 🔍 Thiết lập role và format tự động cho code bằng eslint
├── jest.config.ts                          # 🃏 Cấu hình Jest test framework
├── jest.setup.ts                           # 🎬 Setup code chạy trước mỗi test
├── package.json                            # 📦 
├── pnpm-lock.yaml                          # 🔒 Lock exact versions của dependencies, Đảm bảo consistent installs across machines
├── pnpm-workspace.yaml                     # 🏢 Config cho monorepo setup
├── README.md                               # 📖 TÀI LIỆU DỰ ÁN cách setup, sử dụng, Quy ước code, naming conventions
├── tsconfig.json                           # ⚙️ Cấu hình TypeScript compiler
└── tsup.config.ts                          # 📦 Fast TypeScript bundler
```

### 📌 Giải Thích Kiến Trúc Layers

**Luồng xử lý request điển hình**:
```
Client Request 
    ↓
🛣️ Router (định tuyến đến controller phù hợp)
    ↓
🎮 Controller (nhận request, validate input)
    ↓
💼 Service (xử lý business logic)
    ↓
🗃️ Repository (thao tác database)
    ↓
💾 Database (Prisma ORM)
    ↓
🗃️ Repository (trả data)
    ↓
💼 Service (transform data)
    ↓
🎮 Controller (format response)
    ↓
🛣️ Router
    ↓
Client Response
```

**Separation of Concerns (Tách biệt trách nhiệm)**:
- **Router**: Chỉ định nghĩa routes và middlewares
- **Controller**: Chỉ xử lý HTTP (request/response)
- **Service**: Chỉ chứa business logic
- **Repository**: Chỉ thao tác database

---

## Quy Ước Đặt Tên

### 1. Tên File

#### a. TypeScript Files

- **Controllers**: `<module>.controller.ts`
    - Ví dụ: `users.controller.ts`, `auth.controller.ts`
- **Services**: `<module>.service.ts`
    - Ví dụ: `users.service.ts`, `auth.service.ts`
- **Repositories**: `<module>.repository.ts`
    - Ví dụ: `users.repository.ts`, `auth.repository.ts`
- **Routers**: `<module>.router.ts`
    - Ví dụ: `users.router.ts`, `auth.router.ts`
- **DTOs**: `<name>.dto.ts`
    - Ví dụ: `httpResponse.dto.ts`, `pagination.dto.ts`
- **Middlewares**: `<name>.middleware.ts`
    - Ví dụ: `auth.middleware.ts`, `errorHandler.middleware.ts`
- **Utils**: `<name>.utils.ts`
    - Ví dụ: `jwt.utils.ts`, `pagination.utils.ts`
- **Interfaces**: `<name>.interface.ts`
    - Ví dụ: `tokenPayload.interface.ts`
- **Enums**: `<name>.enum.ts`
    - Ví dụ: `permissions.enum.ts`, `roles.enum.ts`
- **Exceptions**: `<name>.exception.ts`
    - Ví dụ: `notFound.exception.ts`, `unauthorized.exception.ts`
- **Configs**: `<name>.config.ts`
    - Ví dụ: `app.config.ts`, `jwt.config.ts`

#### b. Test Files

- **Unit Tests**: `<module>.test.ts` hoặc `<module>.spec.ts`
    - Ví dụ: `users.service.test.ts`

#### c. Configuration Files

- Sử dụng lowercase với dấu gạch ngang: `docker-compose.yml`, `tsup.config.ts`

### 2. Tên Thư Mục

- **Modules**: Sử dụng **số nhiều**, lowercase
    - Ví dụ: `users/`, `projects/`, `permissions/`
- **Common folders**: Sử dụng **số nhiều**, lowercase
    - Ví dụ: `dtos/`, `middlewares/`, `utils/`, `interfaces/`, `enums/`, `exceptions/`
- **Config folders**: Sử dụng số ít, lowercase
    - Ví dụ: `configs/`, `models/`, `swagger/`

### 3. Tên Biến

#### a. Variables (camelCase)

```typescript
// Biến thường
const userName = 'John Doe';
const isActive = true;
const userAge = 25;

// Biến private trong class (với underscore prefix)
private _userId: string;
private _isAuthenticated: boolean;

// Biến function/method parameters
function getUserById(userId: string) { }
function validateEmail(emailAddress: string) { }
```

#### b. Constants (UPPER_SNAKE_CASE)

```typescript
// Constants toàn cục
const MAX_LOGIN_ATTEMPTS = 5;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_PAGE_SIZE = 10;

// Environment variables
const { NODE_ENV, PORT, CORS_ORIGIN } = appEnv;
```

#### c. Enums (PascalCase cho tên, UPPER_SNAKE_CASE cho values)

```typescript
export enum RolesEnum {
	SUPER_ADMIN = 'SUPER_ADMIN',
	ADMIN = 'ADMIN',
	USER = 'USER',
}

export enum PermissionsEnum {
	CREATE_USER = 'CREATE_USER',
	DELETE_USER = 'DELETE_USER',
}
```

### 4. Tên Class và Interface

#### a. Classes (PascalCase với suffix)

```typescript
// Controllers
export class UsersController {}
export class AuthController {}

// Services
export class UsersService {}
export class AuthService {}

// Repositories
export class UsersRepository {}
export class AuthRepository {}

// DTOs
export class HttpResponseDto {}
export class PaginationDto {}
export class HttpResponseBodySuccessDto<T> {}

// Exceptions
export class NotFoundException extends HTTPException {}
export class UnauthorizedException extends HTTPException {}

// Middlewares
export class AuthMiddleware {}
export class BaseAutoBindMiddleware {}
```

#### b. Interfaces (PascalCase với suffix Interface)

```typescript
export interface TokenPayloadInterface {
	userId: string;
	email: string;
}

export interface PaginationInterface {
	page: number;
	limit: number;
}
```

### 5. Tên Function và Method

#### a. Functions (camelCase, động từ đứng đầu)

```typescript
// Service methods
async getUserById(userId: string) { }
async createUser(data: CreateUserDto) { }
async updateUserProfile(userId: string, data: UpdateUserDto) { }
async deleteUser(userId: string) { }

// Utility functions
export function autoBindUtil<T>(instance: T) { }
export function useController(controller: any) { }
export function getResponse() { }

// Validation functions
function validateEmail(email: string) { }
function isAuthenticated(token: string) { }

// Boolean returns (sử dụng is/has/can prefix)
function isAdmin(user: User) { }
function hasPermission(user: User, permission: string) { }
function canAccessResource(user: User, resource: string) { }
```

---

## Chi Tiết Các Thư Mục

### 📁 `/src/common/` - Code Dùng Chung

Chứa các thành phần được sử dụng chung trong toàn bộ dự án.

#### `/src/common/dtos/`

**Chức năng**: Chứa các Data Transfer Objects - định nghĩa cấu trúc dữ liệu truyền giữa các layer.

**Files mẫu**:

- `httpResponse.dto.ts` - DTO cho HTTP response
- `httpResponseBodySuccess.dto.ts` - DTO cho response body thành công
- `pagination.dto.ts` - DTO cho phân trang
- `serviceResponse.dto.ts` - DTO cho response từ service layer

**Quy ước**:

- Class name: `<Name>Dto`
- Sử dụng class-validator decorators để validate
- Export qua `index.ts`

#### `/src/common/enums/`

**Chức năng**: Chứa các enum định nghĩa các giá trị cố định.

**Files mẫu**:

- `permissions.enum.ts` - Enum các quyền hạn
- `roles.enum.ts` - Enum các vai trò

**Quy ước**:

- Enum name: `<Name>Enum`
- Values: UPPER_SNAKE_CASE

#### `/src/common/exceptions/`

**Chức năng**: Custom exceptions cho error handling.

**Files mẫu**:

- `notFound.exception.ts` - Lỗi 404
- `unauthorized.exception.ts` - Lỗi 401
- `forbidden.exception.ts` - Lỗi 403
- `conflict.exception.ts` - Lỗi 409
- `internalServer.exception.ts` - Lỗi 500

**Quy ước**:

- Class name: `<Name>Exception`
- Extend từ `HTTPException`

#### `/src/common/interfaces/`

**Chức năng**: Định nghĩa các interface/type chung.

**Files mẫu**:

- `tokenPayload.interface.ts` - Interface cho JWT payload

**Quy ước**:

- Interface name: `<Name>Interface`
- Hoặc sử dụng type alias với suffix `Type`

#### `/src/common/middlewares/`

**Chức năng**: Express middlewares sử dụng chung.

**Files mẫu**:

- `auth.middleware.ts` - Xác thực người dùng
- `errorHandler.middleware.ts` - Xử lý lỗi tập trung
- `validationRequest.middleware.ts` - Validate request data
- `requestContext.middleware.ts` - Quản lý request context
- `setCookie.middleware.ts` - Set cookie cho response

**Quy ước**:

- Class name: `<Name>Middleware`
- File name: `<name>.middleware.ts`
- Export function hoặc class instance

#### `/src/common/utils/`

**Chức năng**: Utility functions/helpers.

**Files mẫu**:

- `autoBind.utils.ts` - Auto bind class methods
- `jwt.utils.ts` - JWT utilities
- `pagination.utils.ts` - Pagination helpers
- `requestContext.util.ts` - Request context helpers
- `useController.util.ts` - Controller helpers

**Quy ước**:

- Function name: `<name>Util` hoặc `<verb><Noun>`
- Pure functions, stateless

---

### 📁 `/src/configs/` - Cấu Hình

Chứa các file cấu hình cho ứng dụng.

**Files mẫu**:

- `app.config.ts` - Cấu hình chung (PORT, HOST, CORS...)
- `jwt.config.ts` - Cấu hình JWT
- `googleOauth.config.ts` - Cấu hình Google OAuth
- `mails.config.ts` - Cấu hình email service
- `otps.config.ts` - Cấu hình OTP
- `users.config.ts` - Cấu hình user module

**Quy ước**:

- Export biến config với prefix: `<module>Env` hoặc `<module>Config`
- Sử dụng `envalid` để validate environment variables
- Ví dụ: `export const appEnv = cleanEnv(process.env, {...})`

---

### 📁 `/src/models/` - Prisma Generated Models

**Chức năng**: Chứa các schema, types, validators tự động generate từ Prisma.

**Thư mục con**:

- `inputTypeSchemas/` - Input schemas cho Prisma operations
- `modelSchema/` - Model schemas
- `outputTypeSchemas/` - Output type schemas

**Lưu ý**:

- Folder này được auto-generated, KHÔNG chỉnh sửa trực tiếp
- Regenerate bằng: `pnpm db:gen-dto`

---

### 📁 `/src/modules/` - Business Logic Modules

**Chức năng**: Chứa các module business logic, mỗi module là một feature hoàn chỉnh.

**Cấu trúc 1 module chuẩn** (ví dụ: `users/`):

```
users/
├── dtos/                          # DTOs riêng của module
│   ├── createUser.dto.ts
│   ├── updateUser.dto.ts
│   └── index.ts
├── users.controller.ts            # Controller - xử lý HTTP requests
├── users.service.ts               # Service - business logic
├── users.repository.ts            # Repository - database operations
└── users.router.ts                # Router - định nghĩa routes
```

**Modules hiện có**:

- `auth/` - Xác thực và phân quyền (login, register, OAuth)
- `users/` - Quản lý người dùng
- `projects/` - Quản lý dự án
- `roles/` - Quản lý vai trò
- `permissions/` - Quản lý quyền hạn
- `database/` - Database utilities (seed, migration helpers)
- `healthCheck/` - Health check endpoint
- `mails/` - Email service
- `otps/` - OTP service

**Quy ước trong module**:

1. **Controller** (`<module>.controller.ts`):
    - Class: `<Module>Controller`
    - Xử lý HTTP request/response
    - Validate input
    - Gọi service methods
    - Return HTTP response

2. **Service** (`<module>.service.ts`):
    - Class: `<Module>Service`
    - Chứa business logic
    - Gọi repository methods
    - Xử lý data transformation
    - Return ServiceResponse

3. **Repository** (`<module>.repository.ts`):
    - Class: `<Module>Repository`
    - Tương tác với database qua Prisma
    - CRUD operations
    - Complex queries
    - Return raw data hoặc null

4. **Router** (`<module>.router.ts`):
    - Const: `<module>Router`
    - Định nghĩa routes
    - Apply middlewares
    - Bind controller methods

---

### 📁 `/src/swagger/` - API Documentation

**Chức năng**: Cấu hình và generate OpenAPI/Swagger documentation.

**Files**:

- `openAPIDocumentGenerator.ts` - Generate OpenAPI document
- `openAPIResponseBuilders.ts` - Build response schemas
- `openAPIRouter.ts` - Swagger UI router
- `constants.ts` - Constants cho Swagger

---

### 📁 `/tests/` - Testing

**Chức năng**: Chứa tất cả các test cases.

**Cấu trúc**:

```
tests/
├── __mocks__/                    # Mock implementations
│   └── @tsed/                   # Mock cho external packages
└── unit/                        # Unit tests
    └── modules/                 # Tests theo modules
        ├── users/
        │   ├── users.service.test.ts
        │   └── users.repository.test.ts
        └── auth/
```

**Quy ước**:

- Test file: `<name>.test.ts` hoặc `<name>.spec.ts`
- Describe block: Tên class/function đang test
- It block: Mô tả hành vi cụ thể
- Arrange-Act-Assert pattern

---

### 📁 `/prisma/` - Database Schema

**Chức năng**: Quản lý database schema và migrations.

**Files**:

- `schema.prisma` - Định nghĩa models, relations, indexes

**Commands**:

- `pnpm db:push` - Đẩy schema lên database
- `pnpm db:gen-dto` - Generate Prisma client và DTOs
- `pnpm db:gen-migration` - Tạo migration file

---

## Quy Ước Code

### 1. Import Order

```typescript
// 1. External dependencies
import express from 'express';
import { injectable } from 'tsyringe';

// 2. Internal modules - absolute imports
import { UsersService } from '@/modules/users';
import { AuthMiddleware } from '@/common';

// 3. Relative imports
import { CreateUserDto } from './dtos';

// 4. Types/Interfaces
import type { Request, Response } from 'express';
```

### 2. Class Structure

```typescript
@injectable()
export class UsersService extends BaseAutoBindMiddleware {
	// 1. Properties
	private readonly usersRepository: UsersRepository;

	// 2. Constructor
	constructor(usersRepository: UsersRepository) {
		super();
		this.usersRepository = usersRepository;
	}

	// 3. Public methods
	async getUsers() {}
	async getUserById(id: string) {}

	// 4. Private methods
	private validateUser() {}
	private formatUserData() {}
}
```

### 3. Error Handling

```typescript
// Sử dụng custom exceptions
if (!user) {
	throw new NotFoundException('User not found');
}

if (!hasPermission) {
	throw new ForbiddenException('Access denied');
}

// Try-catch khi cần
try {
	await this.performOperation();
} catch (error) {
	throw new InternalServerException('Operation failed');
}
```

### 4. Async/Await

```typescript
// ✅ Good
async getUserById(userId: string): Promise<User> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
        throw new NotFoundException('User not found');
    }
    return user;
}

// ❌ Bad - không return Promise
getUserById(userId: string): User {
    return this.usersRepository.findById(userId); // Missing await
}
```

### 5. Type Safety

```typescript
// ✅ Good - Explicit types
async createUser(data: CreateUserDto): Promise<User> {
    const user = await this.usersRepository.create(data);
    return user;
}

// ❌ Bad - No types
async createUser(data): Promise<any> {
    return await this.usersRepository.create(data);
}
```

### 6. Dependency Injection

```typescript
// Sử dụng tsyringe
import { injectable, inject } from 'tsyringe';

@injectable()
export class UsersService {
	constructor(
		private readonly usersRepository: UsersRepository,
		@inject('MailService') private readonly mailService: MailService,
	) {}
}
```

### 7. Environment Variables

```typescript
// ✅ Good - Validated with envalid
import { cleanEnv, str, port } from 'envalid';

export const appEnv = cleanEnv(process.env, {
	PORT: port({ default: 3000 }),
	DATABASE_URL: str(),
	JWT_SECRET: str(),
});

// ❌ Bad - Direct access
const port = process.env.PORT || 3000;
```

---

## Scripts Npm

```bash
# Development
pnpm dev              # Chạy development server với hot reload

# Build & Production
pnpm build           # Build production
pnpm start           # Chạy production server

# Code Quality
pnpm lint            # Chạy ESLint
pnpm format          # Format code với Prettier

# Testing
pnpm test            # Chạy tất cả tests
pnpm test:watch      # Chạy tests ở watch mode
pnpm test:coverage   # Chạy tests với coverage report
pnpm test:unit       # Chạy unit tests
pnpm test:e2e        # Chạy E2E tests

# Database
pnpm db:push         # Đẩy schema lên database
pnpm db:gen-dto      # Generate Prisma client
pnpm db:gen-migration # Tạo migration mới
```

---

## Best Practices

### 1. Luôn sử dụng TypeScript types

- Tránh `any`, sử dụng `unknown` nếu cần
- Định nghĩa rõ ràng return types cho functions
- Sử dụng generics khi cần thiết

### 2. Single Responsibility Principle

- Mỗi class/function chỉ làm một việc
- Controller chỉ handle HTTP
- Service chứa business logic
- Repository chỉ thao tác database

### 3. DRY (Don't Repeat Yourself)

- Tạo utils/helpers cho code lặp lại
- Sử dụng base classes cho shared behavior
- Export và reuse qua index.ts

### 4. Error Handling

- Sử dụng custom exceptions
- Centralized error handling trong middleware
- Meaningful error messages

### 5. Security

- Validate tất cả inputs
- Sanitize user data
- Sử dụng helmet, cors middlewares
- Không expose sensitive data trong errors

### 6. Testing

- Write tests cho business logic
- Mock external dependencies
- Aim for >80% coverage

---

## Liên Hệ & Đóng Góp

Khi đóng góp code, vui lòng:

1. Follow các quy ước đặt tên trên
2. Chạy `pnpm lint` và `pnpm format` trước khi commit
3. Viết tests cho code mới
4. Update README nếu có thay đổi cấu trúc

---

**Tài liệu này được cập nhật**: October 17, 2025
