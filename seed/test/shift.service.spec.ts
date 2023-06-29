import { describe, expect, test } from '@jest/globals';
import prisma from '../src/db/prisma';
import createShiftService from '../src/services/shift.service';
import { setup, SeedData } from './seed';

describe('shift service', () => {
  const service = createShiftService({ prisma });
  let data: SeedData;

  beforeAll(async () => {
    data = await setup(prisma);
  });

  afterAll(async () => {
    await data.teardownFn();
  });

  describe('#find', () => {
    test('should throw with invalid input', async () => {
      try {
        await service.find({ workerId: -1 });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });

    test('should find shifts where worker has no docs', async () => {
      const { worker1, shift1, shift2 } = data;
      const shifts = await service.find({ workerId: worker1.id });
      const shiftIds = shifts.map((s) => s.id);
      expect(shiftIds).toContain(shift1.id);
      expect(shiftIds).not.toContain(shift2.id);
    });

    test('should find shifts where worker has doc1', async () => {
      const { worker2, shift1, shift2 } = data;
      const shifts = await service.find({ workerId: worker2.id });
      const shiftIds = shifts.map((s) => s.id);
      expect(shiftIds).toContain(shift1.id);
      expect(shiftIds).toContain(shift2.id);
    });
  });
});
