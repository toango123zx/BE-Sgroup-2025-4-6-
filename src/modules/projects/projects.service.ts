import { UserInformationDto } from '../users/dtos';

import { CreateProjectRequestDto } from './dtos';
import { ProjectsRepository } from './projects.repository';

import { HttpResponseBodySuccessDto, RolesEnum } from '@/common';

export class ProjectsService {
	constructor(private readonly projectsRepository = new ProjectsRepository()) {}

	async createProject(
		createProjectRequestDto: CreateProjectRequestDto,
		myInformationDto: UserInformationDto,
	): Promise<HttpResponseBodySuccessDto<any>> {
		const project = await this.projectsRepository.createProject({
			name: createProjectRequestDto.name,
			description: createProjectRequestDto.description,
			projectMembers: {
				create: {
					user: {
						connect: {
							id: myInformationDto.id,
						},
					},
					role: {
						connect: {
							name: RolesEnum.PROJECT_OWNER,
						},
					},
				},
			},
		});
		return {
			success: true,
			data: project,
		};
	}
}
