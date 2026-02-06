import { ProjectsStatusEnum } from '@prisma/client';

import { RolesEnum } from '@/common';
import { projectsWithRelations } from '@/models';

export class CreateProjectResponseDto {
	projectId: string;
	name: string;
	description?: string | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date | null;
	status: ProjectsStatusEnum;
	projectMembers?: {
		userId: string;
		name: string;
		email: string;
		roleId: string;
		roleName: string;
	} | null;

	constructor(data: projectsWithRelations) {
		this.projectId = data.id;
		this.name = data.name;
		this.description = data.description;
		this.createdAt = data.createdAt;
		this.updatedAt = data.updatedAt;
		this.deletedAt = data.deletedAt;
		this.status = data.status;
		this.projectMembers =
			data.projectMembers && data.projectMembers[0] && data.projectMembers[0].user
				? {
						userId: data.projectMembers[0].user.id,
						name: data.projectMembers[0].user.name,
						email: data.projectMembers[0].user.email,
						roleId: data.projectMembers[0].roleId,
						roleName: RolesEnum.PROJECT_OWNER,
					}
				: {};
	}
}
