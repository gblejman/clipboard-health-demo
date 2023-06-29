import { PrismaClient, Shift } from '@prisma/client';

export interface ShiftService {
  find: ({ workerId }: { workerId: number }) => Promise<Shift[]>;
}

const create = ({ prisma }: { prisma: PrismaClient }): ShiftService => {
  const find = async ({ workerId }: { workerId: number }) => {
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

  return { find };
};

export default create;
