import { PrismaService } from '../database';

export class PermissionsRepository {
	constructor(private readonly prismaService = new PrismaService()) {}
}
