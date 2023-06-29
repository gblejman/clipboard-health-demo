import 'dotenv/config';

export type Config = {
  isProd: boolean;
  server: {
    port: number;
  };
  logger: {
    level: string;
  };
};

const isProd = process.env.NODE_ENV === 'production';

const config = {
  isProd,
  server: { port: Number(process.env.SERVER_PORT) || 3000 },
  logger: {
    level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  },
};

export default config;
