import { describe, expect, test } from '@jest/globals';
import { Shift } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import prisma from '../src/db/prisma';
import config from '../src/config';
import createShiftService from '../src/services/shift.service';
import createApp from '../src/app';
import { setup, SeedData } from './seed';

describe('GET /shifts', () => {
  let data: SeedData;
  let app: FastifyInstance;

  beforeAll(async () => {
    const shiftService = createShiftService({ prisma });
    app = await createApp({ config, shiftService });
    data = await setup(prisma);
  });

  afterAll(async () => {
    await data.teardownFn();
  });

  describe('memory impl', () => {
    test('should fail with status 400 when invalid input', async () => {
      const response = await app.inject({
        method: 'get',
        url: '/api/shifts',
        query: { workerId: '-1' },
      });

      expect(response.statusCode).toBe(400);
    });

    test('should fail with status 404 when not found', async () => {
      const response = await app.inject({
        method: 'get',
        url: '/api/shifts',
        query: { workerId: '1000000' },
      });

      expect(response.statusCode).toBe(404);
    });

    test('should find shifts where worker has no docs', async () => {
      const { worker1, shift1, shift2 } = data;

      const response = await app.inject({
        method: 'get',
        url: '/api/shifts',
        query: { workerId: String(worker1.id) },
      });

      const shifts: Shift[] = response.json().data;
      const shiftIds = shifts.map((s) => s.id);

      expect(response.statusCode).toBe(200);
      expect(shiftIds).toContain(shift1.id);
      expect(shiftIds).not.toContain(shift2.id);
    });

    test('should find shifts where worker has doc1', async () => {
      const { worker2, shift1, shift2 } = data;

      const response = await app.inject({
        method: 'get',
        url: '/api/shifts',
        query: { workerId: String(worker2.id) },
      });

      const shifts: Shift[] = response.json().data;
      const shiftIds = shifts.map((s) => s.id);
      expect(shiftIds).toContain(shift1.id);
      expect(shiftIds).toContain(shift2.id);
    });
  });

  describe('raw impl', () => {
    test('should fail with status 400 when invalid input', async () => {
      const response = await app.inject({
        method: 'get',
        url: '/api/shifts',
        query: { workerId: '-1' },
      });

      expect(response.statusCode).toBe(400);
    });

    test('should fail with status 404 when not found', async () => {
      const response = await app.inject({
        method: 'get',
        url: '/api/shifts',
        query: { workerId: '1000000' },
      });

      expect(response.statusCode).toBe(404);
    });

    test('should find shifts where worker has no docs', async () => {
      const { worker1, shift1, shift2 } = data;

      const response = await app.inject({
        method: 'get',
        url: '/api/shifts',
        query: { workerId: String(worker1.id), strategy: 'raw' },
      });

      const shifts: Shift[] = response.json().data;
      const shiftIds = shifts.map((s) => s.id);
      expect(shiftIds).toContain(shift1.id);
      expect(shiftIds).not.toContain(shift2.id);
    });

    test('should find shifts where worker has doc1', async () => {
      const { worker2, shift1, shift2 } = data;

      const response = await app.inject({
        method: 'get',
        url: '/api/shifts',
        query: { workerId: String(worker2.id), strategy: 'raw' },
      });

      const shifts: Shift[] = response.json().data;
      const shiftIds = shifts.map((s) => s.id);
      expect(shiftIds).toContain(shift1.id);
      expect(shiftIds).toContain(shift2.id);
    });
  });
});
