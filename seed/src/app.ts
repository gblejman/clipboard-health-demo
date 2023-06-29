import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { Config } from './config';
import { ShiftService } from './services/shift.service';
import logger from './logger';

const findShiftInputSchema = z.object({
  workerId: z.coerce.number().positive().int(),
  strategy: z.enum(['memory', 'raw']).optional().default('memory'),
});

const create = async ({
  config,
  shiftService,
}: {
  config: Config;
  shiftService: ShiftService;
}) => {
  const app = Fastify({
    logger,
  });

  await app.register(cors, {
    origin: config.isProd ? false : '*',
  });

  app.get<{
    Querystring: z.infer<typeof findShiftInputSchema>;
  }>('/api/shifts', async function (request) {
    const { workerId, strategy } = findShiftInputSchema.parse(request.query);

    const start = performance.now();
    const data = await shiftService.find({ workerId, strategy });
    const end = performance.now();

    return { data, meta: { ts: end - start } };
  });

  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    // Custom error for prisma findUniqueOrThrow
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code == 'P2025') {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: error.message,
        });
      }
    }

    // Custom error for validation errors
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation Error',
        cause: error.issues,
      });
    }

    return error;
  });

  return app;
};

export default create;
