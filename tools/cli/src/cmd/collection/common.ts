import path from "node:path";

export const DEFAULT_COLLECTION_CONFIGS_BASE_DIR = path.resolve(__dirname, '../../../../../configs/collections');

export const stringParser = (val: any) => val;

export const booleanParser = (val: any) => Boolean(val);
