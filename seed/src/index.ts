import prisma from './db/prisma';
import config, { Config } from './config';
import createApp from './app';
import createShiftService from './services/shift.service';

const start = async (config: Config) => {
  const shiftService = createShiftService({ prisma });
  const app = await createApp({ config, shiftService });

  try {
    await prisma.$connect();
    await app.listen({ port: config.server.port });
  } catch (err) {
    app.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start(config);
