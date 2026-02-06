import { createServer } from 'http';
import 'reflect-metadata';

import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';

import { openAPIRouter } from './swagger';
import { Modules } from './modules';
import { appEnv } from './configs';
import {
	errorHandlerMiddleware,
	requestContextMiddleware,
	setCookieMiddleware,
} from './common';
import notificationsGateway from './modules/notifications/notifications.gateway';

const app: Express = express();

app.use(express.json());

// Set the application to trust the reverse proxy
app.set('trust proxy', true);

app.use(requestContextMiddleware);

app.use(setCookieMiddleware);

// Passport middleware
app.use(passport.initialize());
// app.use(notificationsGateway.initialize(httpServer(app)))

// Middlewares
app.use(cors({ origin: appEnv.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(morgan('combined'));

app.use('/health-check', Modules.healthCheckRouter);
app.use('/auth', Modules.authRouter);
app.use('/users', Modules.usersRouter);
app.use('/projects', Modules.projectsRouter);
app.use('/notifications', Modules.notificationsRouter);

app.use(errorHandlerMiddleware);

app.use(openAPIRouter);
const server = createServer(app);

notificationsGateway.initialize(server);

server.listen(appEnv.PORT, () => {
	const { NODE_ENV, HOST, PORT } = appEnv;
	console.log(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}/api`);
});