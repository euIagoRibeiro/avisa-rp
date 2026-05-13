import { z } from 'zod';

export const ReportStatusSchema = z.enum(['Pendente', 'Analisando', 'Resolvido']);

export const ReportUpdateSchema = z.object({
  timestamp:  z.string().min(1),
  status:     ReportStatusSchema,
  comment:    z.string(),
});

export const ReportSchema = z.object({
  id:          z.string().min(1),
  tenantId:    z.string().min(1),
  userId:      z.string().min(1),
  title:       z.string().min(1).max(80),
  description: z.string().max(500),
  category:    z.string().min(1),
  address:     z.string().min(1),
  coordinates: z.object({ lat: z.number(), lon: z.number() }),
  status:      ReportStatusSchema,
  isAnonymous: z.boolean(),
  photos:      z.array(z.string()),
  createdAt:   z.string().min(1),
  updates:     z.array(ReportUpdateSchema),
});
