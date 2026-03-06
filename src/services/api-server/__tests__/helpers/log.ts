import pino from 'pino';

export const testLogger = pino({ level: 'error', transport: { target: 'pino-pretty' } });
