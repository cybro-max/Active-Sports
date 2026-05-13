import { z } from 'zod';

export const fixtureIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
  }),
});

export const fixtureQuerySchema = z.object({
  fixture: z.string().regex(/^\d+$/).transform(Number).optional(),
});