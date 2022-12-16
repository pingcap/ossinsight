import { FastifyBaseLogger, FastifyInstance, FastifyTypeProviderDefault, RawServerDefault } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';

import { Params } from 'fastify-cron';

export type FastifyServer = FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, FastifyTypeProviderDefault>;

export type JobName = string;

export type CronJobDef = Params;
