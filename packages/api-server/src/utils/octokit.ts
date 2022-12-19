import {Octokit} from "octokit";
import pino from "pino";

export function getOctokit(token: string | undefined, log: pino.BaseLogger): Octokit {
    if (!token) {
        log.warn('No GitHub personal token provided. Using anonymous GitHub client.');
    }

    return new Octokit({
        auth: token,
        log: {
            debug: log.debug.bind(log),
            info: log.info.bind(log),
            warn: log.warn.bind(log),
            error: log.error.bind(log),
        },
        throttle: {
            onRateLimit: (retryAfter: number, options: any, octokit: Octokit) => {
                octokit.log.warn(
                    `Request quota exhausted for request ${options.method} ${options.url}`
                );

                if (options.request.retryCount <= 1) {
                    // only retries once
                    octokit.log.info(`Retrying after ${retryAfter} seconds!`);
                    return true;
                }
            },
            onSecondaryRateLimit: (retryAfter: number, options: any, octokit: Octokit) => {
                octokit.log.warn(
                    `SecondaryRateLimit detected for request ${options.method} ${options.url}`
                );

                if (options.request.retryCount <= 1) {
                    // only retries once
                    octokit.log.info(`Retrying after ${retryAfter} seconds!`);
                    return true;
                }
            },
        }
    })
}