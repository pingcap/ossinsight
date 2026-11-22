import rawConfig from './params.json';
import type {EndpointConfig} from '../../config';
const config = rawConfig as EndpointConfig;
import sql from './template.sql';

export { config, sql };
