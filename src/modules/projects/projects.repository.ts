import { Prisma, PrismaService } from '../database';

import { projectsWithPartialRelations } from '@/models';

export class ProjectsRepository {
	constructor(private readonly prismaService = new PrismaService()) {}

	async createProject(
		projectInformation: Prisma.projectsCreateInput,
	): Promise<projectsWithPartialRelations> {
		return this.prismaService.projects.create({
			include: {
				projectMembers: {
					include: {
						user: true,
					},
				},
			},
			data: projectInformation,
		});
	}
}
