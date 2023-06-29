import { pino } from 'pino';
import config from '../config';

const logger = pino(config.logger);

export default logger;
