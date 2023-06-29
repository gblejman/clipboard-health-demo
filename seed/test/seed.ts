import {
  Facility,
  Worker,
  Shift,
  Profession,
  PrismaClient,
} from '@prisma/client';

export type SeedData = {
  facility1: Facility;
  shift1: Shift;
  worker1: Worker;
  facility2: Facility;
  shift2: Shift;
  worker2: Worker;
  teardownFn: () => void;
};

export const setup = async (prisma: PrismaClient) => {
  const requiredDocId = 1;
  const profession = Profession.CNA;

  // Use case 1: Shift1 for Facility1 which requires no docs, Worker1 has no docs
  const facility1 = await prisma.facility.create({
    data: {
      name: 'Facility#1',
      is_active: true,
    },
  });

  const shift1 = await prisma.shift.create({
    data: {
      start: new Date(),
      end: new Date(),
      profession: profession,
      facility_id: facility1.id,
      is_deleted: false,
    },
  });

  const worker1 = await prisma.worker.create({
    data: {
      name: 'Worker#1',
      profession,
      is_active: true,
    },
  });

  // Use case 2: Shift2 for Facility2 requires Doc1, worker has Doc1
  const facility2 = await prisma.facility.create({
    data: {
      name: 'Facility#2',
      is_active: true,
    },
  });

  await prisma.facilityRequirement.create({
    data: {
      facility_id: facility2.id,
      document_id: requiredDocId,
    },
  });

  const worker2 = await prisma.worker.create({
    data: {
      name: 'Worker#2',
      profession,
      is_active: true,
    },
  });

  await prisma.documentWorker.create({
    data: { worker_id: worker2.id, document_id: requiredDocId },
  });

  const shift2 = await prisma.shift.create({
    data: {
      start: new Date(),
      end: new Date(),
      profession: profession,
      facility_id: facility2.id,
      is_deleted: false,
    },
  });

  const teardownFn = async () => {
    await prisma.documentWorker.deleteMany({
      where: { worker_id: { in: [worker2.id] } },
    });
    await prisma.facilityRequirement.deleteMany({
      where: { facility_id: { in: [facility2.id] } },
    });
    await prisma.worker.deleteMany({
      where: { id: { in: [worker1.id, worker2.id] } },
    });
    await prisma.shift.deleteMany({
      where: { id: { in: [shift1.id, shift2.id] } },
    });
    await prisma.facility.deleteMany({
      where: { id: { in: [facility1.id, facility2.id] } },
    });
  };

  return {
    facility1,
    shift1,
    worker1,
    facility2,
    shift2,
    worker2,
    teardownFn,
  };
};
