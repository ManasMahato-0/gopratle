import mongoose from 'mongoose';
import {
  CREW_ROLES,
  EVENT_TYPES,
  EXPERIENCE_LEVELS,
  PERFORMER_TYPES,
  PLANNER_SERVICES,
} from '../constants.js';

const { Schema } = mongoose;

const budgetSchema = new Schema({ min: Number, max: Number }, { _id: false });


const requirementSchema = new Schema(
  {
    eventName: { type: String, required: true, trim: true },
    eventType: { type: String, enum: EVENT_TYPES, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, required: true, trim: true },
    venue: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true, discriminatorKey: 'category', collection: 'requirements' },
);

requirementSchema.index({ category: 1, createdAt: -1 });

export const Requirement = mongoose.model('Requirement', requirementSchema);

export const PlannerRequirement = Requirement.discriminator(
  'planner',
  new Schema({
    details: {
      services: [{ type: String, enum: PLANNER_SERVICES }],
      guestCount: { type: Number, required: true },
      theme: String,
      budget: budgetSchema,
      notes: String,
    },
  }),
);

export const PerformerRequirement = Requirement.discriminator(
  'performer',
  new Schema({
    details: {
      performerType: { type: String, enum: PERFORMER_TYPES, required: true },
      genre: String,
      performersCount: { type: Number, required: true },
      durationMinutes: { type: Number, required: true },
      languages: String,
      soundSystemProvided: Boolean,
      budget: budgetSchema,
      notes: String,
    },
  }),
);

export const CrewRequirement = Requirement.discriminator(
  'crew',
  new Schema({
    details: {
      roles: [
        new Schema({ role: { type: String, enum: CREW_ROLES }, count: Number }, { _id: false }),
      ],
      shiftStart: String,
      shiftEnd: String,
      experienceLevel: { type: String, enum: EXPERIENCE_LEVELS },
      ratePerPersonPerDay: Number,
      notes: String,
    },
  }),
);

export const modelFor = {
  planner: PlannerRequirement,
  performer: PerformerRequirement,
  crew: CrewRequirement,
};
