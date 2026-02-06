import { ProjectsService } from './projects.service';

export class ProjectsController {
	constructor(
		private readonly projectsService: ProjectsService = new ProjectsService(),
	) {}

	// async createProject(req: Request): Promise<Response> {
	//     const myInformationDto = req.user as UserInformationDto;
	//     const createProjectRequestDto = new CreateProjectRequestDto(req.body);
	//     const result = await this.projectsService.createProject(createProjectRequestDto, myInformationDto);
	//     if (result instanceof Exception) {
	//         return new HttpResponseDto().exception(result);
	//     }
	//     return new HttpResponseDto().success<any>(result);
	// }
}
