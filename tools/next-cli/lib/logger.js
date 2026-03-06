"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = require("pino");
const opts = {
    base: {
        service: 'sync-github-data'
    },
    transport: {
        targets: [
            {
                level: process.env.LOG_LEVEL || 'info',
                target: 'pino-pretty',
                options: {
                    ignore: 'pid,hostname,service',
                }
            }
        ]
    },
};
exports.logger = (0, pino_1.default)(opts);
