// The key will be mapped to the regexp's 1st group or the whole string.
export function getEnv(envPattern: RegExp) {
    return Object.entries(process.env)
        .flatMap(([key, value]) => {
            const matched = envPattern.exec(key);
            if (matched) {
                return [[matched[1] ?? matched[0], value]] as const;
            } else {
                return [];
            }
        })
}

export const DEFAULT_PLAYGROUND_QUERY_TIMEOUT = 30000;
export const MAX_PLAYGROUND_QUERY_TIMEOUT = 60000;

export function validatePlaygroundQueryTimeout(value: number): number {
    if (!Number.isSafeInteger(value) || value < 1 || value > MAX_PLAYGROUND_QUERY_TIMEOUT) {
        throw new Error('Playground statement timeout must be an integer between 1 and 60000 milliseconds.');
    }
    return value;
}

export function getPlaygroundQueryTimeout(): number {
    const legacy = getEnv(/^PLAYGROUND_SESSION_(.+)$/).filter(([key]) => key.toLowerCase() === 'max_execution_time');
    const raw = process.env.PLAYGROUND_QUERY_SQL_TIMEOUT ?? legacy[0]?.[1];
    if (raw !== undefined && !/^[1-9]\d*$/.test(raw)) throw new Error('Invalid playground statement timeout.');
    return validatePlaygroundQueryTimeout(raw === undefined ? DEFAULT_PLAYGROUND_QUERY_TIMEOUT : Number(raw));
}

export function getPlaygroundSessionLimits() {
    // The executor owns max_execution_time; optional session settings cannot
    // disable its mandatory bounded server/client deadline.
    return getEnv(/^PLAYGROUND_SESSION_(.+)$/).filter(([key]) => key.toLowerCase() !== 'max_execution_time').map(
        ([key, value]) => `SET SESSION ${key} = ${value};`
    );
}
