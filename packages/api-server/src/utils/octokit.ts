import {Octokit} from "octokit";
import pino from "pino";

export const SYMBOL_TOKEN = Symbol('GITHUB_ACCESS_TOKEN');

export function eraseToken (value: string | undefined): string {
    return value ? `****${value.substring(value.length - 8)}` : 'anonymous';
}

export function createOctokitClient(parentLogger: pino.Logger, token: string | undefined): Octokit {
    if (!token) {
        parentLogger.warn('No GitHub personal token provided, using anonymous GitHub client.');
    }

    const erasedToken = eraseToken(token);
    const log = parentLogger.child({ octokit: erasedToken });

    const octokit = new Octokit({
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
    });

    Object.defineProperty(octokit, SYMBOL_TOKEN, {
        value: token,
        writable: false,
        enumerable: false,
        configurable: false
    });

    return octokit;
}

export function getOctokitToken(octokit: Octokit): string {
    const { value: token } = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!;
    return token;
}
