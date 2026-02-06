export class CreateProjectRequestDto {
	name: string;
	description?: string;

	constructor(data: CreateProjectRequestDto) {
		this.name = data.name;
		this.description = data.description;
	}
}
