import { z } from 'zod';

export const fixtureIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
  }),
});

export const predictionSchema = z.object({
  fixtureId: z.number().int().positive(),
  homeGoals: z.number().int().min(0).max(10),
  awayGoals: z.number().int().min(0).max(10),
});

export const fixtureQuerySchema = z.object({
  fixture: z.string().regex(/^\d+$/).transform(Number).optional(),
});