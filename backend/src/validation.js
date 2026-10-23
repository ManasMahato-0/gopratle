import { z } from 'zod';
import {
  CREW_ROLES,
  EVENT_TYPES,
  EXPERIENCE_LEVELS,
  PERFORMER_TYPES,
  PLANNER_SERVICES,
} from './constants.js';

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date');

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM (24h)');

const optionalText = (max) => z.string().trim().max(max).optional().default('');

const budget = z
  .object({
    min: z.number().int().nonnegative(),
    max: z.number().int().positive(),
  })
  .refine((b) => b.max >= b.min, { message: 'Max budget must be at least min', path: ['max'] });

const plannerDetails = z.object({
  services: z.array(z.enum(PLANNER_SERVICES)).min(1, 'Pick at least one service'),
  guestCount: z.number().int().min(1).max(100000),
  theme: optionalText(100),
  budget,
  notes: optionalText(1000),
});

const performerDetails = z.object({
  performerType: z.enum(PERFORMER_TYPES),
  genre: optionalText(60),
  performersCount: z.number().int().min(1).max(200),
  durationMinutes: z.number().int().min(10).max(24 * 60),
  languages: optionalText(100),
  soundSystemProvided: z.boolean(),
  budget,
  notes: optionalText(1000),
});

const crewDetails = z
  .object({
    roles: z
      .array(z.object({ role: z.enum(CREW_ROLES), count: z.number().int().min(1).max(500) }))
      .min(1, 'Add at least one role'),
    shiftStart: time,
    shiftEnd: time,
    experienceLevel: z.enum(EXPERIENCE_LEVELS),
    ratePerPersonPerDay: z.number().int().positive(),
    notes: optionalText(1000),
  })
  .refine((c) => new Set(c.roles.map((r) => r.role)).size === c.roles.length, {
    message: 'Each role should appear only once',
    path: ['roles'],
  })
  .refine((c) => c.shiftStart !== c.shiftEnd, { message: 'Shift has no length', path: ['shiftEnd'] });
// shiftEnd < shiftStart is allowed on purpose: overnight shifts (e.g. 18:00 -> 02:00)

const basics = {
  eventName: z.string().trim().min(3).max(100),
  eventType: z.enum(EVENT_TYPES),
  startDate: dateOnly,
  endDate: dateOnly.optional(),
  location: z.string().trim().min(2).max(100),
  venue: optionalText(120),
};

export const requirementSchema = z
  .discriminatedUnion('category', [
    z.object({ ...basics, category: z.literal('planner'), details: plannerDetails }),
    z.object({ ...basics, category: z.literal('performer'), details: performerDetails }),
    z.object({ ...basics, category: z.literal('crew'), details: crewDetails }),
  ])
  .superRefine((data, ctx) => {
    // Compare as plain date strings so the server timezone doesn't matter.
    // One day of slack so someone in IST submitting just after midnight isn't rejected.
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (data.startDate < yesterday) {
      ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'Event date is in the past' });
    }
    if (data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'End date is before start date' });
    }
  });

// { "details.budget.max": "Max budget must be at least min", ... }
export function formatZodError(err) {
  const fields = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_';
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}
