import { PrismaClient, Shift } from '@prisma/client';

export type FindInput = {
  workerId: number;
  strategy?: 'memory' | 'raw';
};

export type ShiftService = {
  find: ({ workerId }: FindInput) => Promise<Shift[]>;
};

const create = ({ prisma }: { prisma: PrismaClient }): ShiftService => {
  const findInMemory = async ({ workerId }: FindInput) => {
    if (!workerId) {
      return [];
    }

    // Not finding by id could be dealt by just returning [], it is a semantic decision to throw instead
    const worker = await prisma.worker.findUniqueOrThrow({
      where: {
        id: workerId,
      },
      include: {
        documents: { select: { document_id: true }, distinct: 'document_id' },
      },
    });

    // Also semantic decision, if user exists but is not active return []
    if (!worker.is_active) {
      return [];
    }

    const shifts = await prisma.shift.findMany({
      where: {
        is_deleted: false,
        worker_id: null,
        facility: { is_active: true },
        profession: worker.profession,
      },
      orderBy: { start: 'asc' },
      include: {
        facility: {
          include: {
            requirements: {
              select: { document_id: true },
              distinct: 'document_id',
            },
          },
        },
      },
    });

    // Keep shifts where worker meets all requirement docs
    const filtered = shifts.filter((shift) => {
      const facilityDocIds = new Set(
        shift.facility.requirements.map((d) => d.document_id),
      );
      const workerDocIds = new Set(worker.documents.map((d) => d.document_id));
      const difference = new Set(
        [...facilityDocIds].filter((id) => !workerDocIds.has(id)),
      );

      return !difference.size;
    });

    return filtered;
  };

  const findRaw = async ({ workerId }: FindInput) => {
    if (!workerId) {
      return [];
    }

    const worker = await prisma.worker.findUniqueOrThrow({
      where: {
        id: workerId,
      },
    });

    if (!worker.is_active) {
      return [];
    }

    const shifts: Shift[] = await prisma.$queryRaw`
      select s.* from "Shift" s
        join "Facility" f on f.id = s.facility_id and not exists (
          select fr.document_id from "FacilityRequirement" fr where fr.facility_id = f.id
          except
          select dw.document_id from "DocumentWorker" dw where worker_id = ${worker.id}
        )
        where 
        s.is_deleted = false and
        s.worker_id is null and
        f.is_active = true
        order by s.start asc
    `;

    return shifts;
  };

  const findStrategy = {
    memory: findInMemory,
    raw: findRaw,
  };

  const find = async ({ workerId, strategy = 'memory' }: FindInput) => {
    const start = performance.now();
    const data = await (findStrategy[strategy] || 'memory')({ workerId });
    const end = performance.now();

    console.log(`ShiftService#find`, {
      workerId,
      strategy,
      timeMs: end - start,
    });

    return data;
  };

  return { find };
};

export default create;
