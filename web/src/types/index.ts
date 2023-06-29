import { z } from "zod";

const shiftSchema = z.object({
  id: z.number().positive().int(),
  facility_id: z.number().positive().int(),
  profession: z.enum(["CNA", "LVN", "RN"]),
  start: z.date(),
  end: z.date(),
});

export type Shift = z.infer<typeof shiftSchema>;
