import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';

import { ProjectsController } from './projects.controller';

import { autoBindUtil } from '@/common';

const projectsController = new ProjectsController();

export const projectsRegistry = new OpenAPIRegistry();

const router = express.Router({ mergeParams: true });
autoBindUtil(projectsController);

// projectsRegistry.registerPath({
//     method: 'post',
//     path: '/projects',
//     tags: ['Projects'],
//     responses: createApiResponse(z.null(), 'Success', StatusCodes.OK),
// });
// router.post('/', projectsController.createProject);

export const projectsRouter = router;
