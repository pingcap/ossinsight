/**
 * Get a required environment variable. Throws if not set.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Get an optional environment variable with a default.
 */
export function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Get an environment variable as a number.
 */
export function envAsNumber(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  if (isNaN(num)) return defaultValue;
  return num;
}

/**
 * Get an environment variable as a boolean.
 */
export function envAsBoolean(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (!value) return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * Get an environment variable as a comma-separated array.
 */
export function envAsArray(name: string, defaultValue: string[] = []): string[] {
  const value = process.env[name];
  if (!value) return defaultValue;
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Common environment configuration shared across services.
 */
export interface BaseEnvConfig {
  NODE_ENV: string;
  LOG_LEVEL: string;
  DATABASE_URL: string;
  CONFIGS_PATH: string;
}

export function loadBaseEnv(): BaseEnvConfig {
  return {
    NODE_ENV: optionalEnv('NODE_ENV', 'development'),
    LOG_LEVEL: optionalEnv('LOG_LEVEL', 'info'),
    DATABASE_URL: requireEnv('DATABASE_URL'),
    CONFIGS_PATH: optionalEnv('CONFIGS_PATH', '../../../configs'),
  };
}
