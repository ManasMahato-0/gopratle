import type { Category } from './options';

// Number inputs are kept as strings while editing and converted in toPayload()

export type PlannerForm = {
  services: string[];
  guestCount: string;
  theme: string;
  budgetMin: string;
  budgetMax: string;
  notes: string;
};

export type PerformerForm = {
  performerType: string;
  genre: string;
  performersCount: string;
  durationMinutes: string;
  languages: string;
  soundSystemProvided: boolean;
  budgetMin: string;
  budgetMax: string;
  notes: string;
};

export type CrewRole = { role: string; count: string };

export type CrewForm = {
  roles: CrewRole[];
  shiftStart: string;
  shiftEnd: string;
  experienceLevel: string;
  ratePerPersonPerDay: string;
  notes: string;
};

export type FormState = {
  eventName: string;
  eventType: string;
  multiDay: boolean;
  startDate: string;
  endDate: string;
  location: string;
  venue: string;
  category: Category | '';
  // all three are kept so switching category back and forth doesn't wipe what was typed
  planner: PlannerForm;
  performer: PerformerForm;
  crew: CrewForm;
};

export type Errors = Record<string, string>;

export const initialForm: FormState = {
  eventName: '',
  eventType: '',
  multiDay: false,
  startDate: '',
  endDate: '',
  location: '',
  venue: '',
  category: '',
  planner: { services: [], guestCount: '', theme: '', budgetMin: '', budgetMax: '', notes: '' },
  performer: {
    performerType: '',
    genre: '',
    performersCount: '1',
    durationMinutes: '',
    languages: '',
    soundSystemProvided: false,
    budgetMin: '',
    budgetMax: '',
    notes: '',
  },
  crew: {
    roles: [{ role: '', count: '1' }],
    shiftStart: '',
    shiftEnd: '',
    experienceLevel: 'any',
    ratePerPersonPerDay: '',
    notes: '',
  },
};

// "YYYY-MM-DD" in the user's own timezone
export function todayString() {
  return new Date().toLocaleDateString('en-CA');
}

const isWholeNumber = (s: string) => /^\d+$/.test(s.trim());

function checkBudget(min: string, max: string, e: Errors) {
  if (!isWholeNumber(min)) e.budgetMin = 'Enter an amount';
  if (!isWholeNumber(max) || Number(max) === 0) e.budgetMax = 'Enter an amount';
  if (!e.budgetMin && !e.budgetMax && Number(max) < Number(min)) {
    e.budgetMax = 'Max should be more than min';
  }
}

function checkCount(value: string, key: string, e: Errors, min = 1, max = 100000) {
  const n = Number(value);
  if (!isWholeNumber(value) || n < min || n > max) e[key] = `Enter a number between ${min} and ${max}`;
}

function validateBasics(f: FormState): Errors {
  const e: Errors = {};
  if (f.eventName.trim().length < 3) e.eventName = 'Give the event a name (3+ characters)';
  if (!f.eventType) e.eventType = 'Pick an event type';
  if (!f.startDate) e.startDate = 'Pick a date';
  else if (f.startDate < todayString()) e.startDate = "Date can't be in the past";
  if (f.multiDay) {
    if (!f.endDate) e.endDate = 'Pick an end date';
    else if (f.startDate && f.endDate < f.startDate) e.endDate = 'End date is before start date';
  }
  if (f.location.trim().length < 2) e.location = 'Where is it happening?';
  if (!f.category) e.category = 'Choose who you are looking for';
  return e;
}

const categorySteps: Record<Category, [(f: FormState) => Errors, (f: FormState) => Errors]> = {
  planner: [
    ({ planner: p }) => {
      const e: Errors = {};
      if (p.services.length === 0) e.services = 'Pick at least one service';
      checkCount(p.guestCount, 'guestCount', e);
      return e;
    },
    ({ planner: p }) => {
      const e: Errors = {};
      checkBudget(p.budgetMin, p.budgetMax, e);
      return e;
    },
  ],
  performer: [
    ({ performer: p }) => {
      const e: Errors = {};
      if (!p.performerType) e.performerType = 'Pick a performer type';
      checkCount(p.performersCount, 'performersCount', e, 1, 200);
      return e;
    },
    ({ performer: p }) => {
      const e: Errors = {};
      checkCount(p.durationMinutes, 'durationMinutes', e, 10, 1440);
      checkBudget(p.budgetMin, p.budgetMax, e);
      return e;
    },
  ],
  crew: [
    ({ crew: c }) => {
      const e: Errors = {};
      const seen = new Set<string>();
      c.roles.forEach((r, i) => {
        if (!r.role) e[`roles.${i}.role`] = 'Pick a role';
        else if (seen.has(r.role)) e[`roles.${i}.role`] = 'Already added';
        seen.add(r.role);
        checkCount(r.count, `roles.${i}.count`, e, 1, 500);
      });
      if (c.roles.length === 0) e.roles = 'Add at least one role';
      return e;
    },
    ({ crew: c }) => {
      const e: Errors = {};
      if (!c.shiftStart) e.shiftStart = 'Required';
      if (!c.shiftEnd) e.shiftEnd = 'Required';
      if (c.shiftStart && c.shiftStart === c.shiftEnd) e.shiftEnd = 'Shift has no length';
      if (!isWholeNumber(c.ratePerPersonPerDay) || Number(c.ratePerPersonPerDay) === 0) {
        e.ratePerPersonPerDay = 'Enter a rate';
      }
      return e;
    },
  ],
};

export function validateStep(step: number, f: FormState): Errors {
  if (step === 0) return validateBasics(f);
  if (!f.category) return { category: 'Choose a category first' };
  if (step === 1 || step === 2) return categorySteps[f.category][step - 1](f);
  return {};
}

// Shape the API expects (see backend/src/validation.js)
export function toPayload(f: FormState) {
  const base = {
    eventName: f.eventName.trim(),
    eventType: f.eventType,
    startDate: f.startDate,
    endDate: f.multiDay ? f.endDate : undefined,
    location: f.location.trim(),
    venue: f.venue.trim(),
    category: f.category,
  };

  switch (f.category) {
    case 'planner': {
      const p = f.planner;
      return {
        ...base,
        details: {
          services: p.services,
          guestCount: Number(p.guestCount),
          theme: p.theme.trim(),
          budget: { min: Number(p.budgetMin), max: Number(p.budgetMax) },
          notes: p.notes.trim(),
        },
      };
    }
    case 'performer': {
      const p = f.performer;
      return {
        ...base,
        details: {
          performerType: p.performerType,
          genre: p.genre.trim(),
          performersCount: Number(p.performersCount),
          durationMinutes: Number(p.durationMinutes),
          languages: p.languages.trim(),
          soundSystemProvided: p.soundSystemProvided,
          budget: { min: Number(p.budgetMin), max: Number(p.budgetMax) },
          notes: p.notes.trim(),
        },
      };
    }
    case 'crew': {
      const c = f.crew;
      return {
        ...base,
        details: {
          roles: c.roles.map((r) => ({ role: r.role, count: Number(r.count) })),
          shiftStart: c.shiftStart,
          shiftEnd: c.shiftEnd,
          experienceLevel: c.experienceLevel,
          ratePerPersonPerDay: Number(c.ratePerPersonPerDay),
          notes: c.notes.trim(),
        },
      };
    }
    default:
      throw new Error('No category selected');
  }
}
