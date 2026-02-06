import { PrismaService } from './prisma.service';

import { PermissionForAdminEnum } from '@/common';

export class SeedService {
	constructor(private readonly prismaService = new PrismaService()) {}

	async seedRolesForAdmin() {
		const PERMISSIONS: string[] = Object.values(PermissionForAdminEnum);

		const permissions = await this.prismaService.permissions.findMany();
		const permissionNamesDB = permissions.map((permission) => permission.name);
		const permissionNames = PERMISSIONS.filter((permissionName) => {
			return !permissionNamesDB.includes(permissionName);
		});
		if (permissionNames.length === 0) {
			return;
		}
		const permissionsData = permissionNames.map((permission) => ({
			name: permission,
			description: permission.replaceAll('_', ' '),
		}));
		await this.prismaService.permissions.createMany({
			data: permissionsData,
			skipDuplicates: true,
		});

		return;
	}
}
