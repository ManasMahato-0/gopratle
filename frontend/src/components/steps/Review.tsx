import type { FormState } from '@/lib/form';
import {
  CATEGORIES,
  CREW_ROLES,
  EVENT_TYPES,
  EXPERIENCE_LEVELS,
  PERFORMER_TYPES,
  PLANNER_SERVICES,
  STEP_TITLES,
  labelOf,
} from '@/lib/options';

type Props = {
  form: FormState;
  goTo: (step: number) => void;
};

const inr = (v: string) => `₹${Number(v).toLocaleString('en-IN')}`;

function Section({ title, step, goTo, rows }: { title: string; step: number; goTo: Props['goTo']; rows: [string, string][] }) {
  return (
    <section className="review-section">
      <header>
        <h3>{title}</h3>
        <button type="button" className="link-button" onClick={() => goTo(step)}>
          Edit
        </button>
      </header>
      <dl>
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
    </section>
  );
}

export default function Review({ form, goTo }: Props) {
  if (!form.category) return null;
  const [title2, title3] = STEP_TITLES[form.category];

  const basics: [string, string][] = [
    ['Event', form.eventName],
    ['Type', labelOf(EVENT_TYPES, form.eventType)],
    ['Date', form.multiDay ? `${form.startDate} to ${form.endDate}` : form.startDate],
    ['Location', form.location],
    ['Venue', form.venue || 'Not decided'],
    ['Looking for', labelOf(CATEGORIES, form.category)],
  ];

  let step2: [string, string][] = [];
  let step3: [string, string][] = [];

  if (form.category === 'planner') {
    const p = form.planner;
    step2 = [
      ['Services', p.services.map((s) => labelOf(PLANNER_SERVICES, s)).join(', ')],
      ['Guests', p.guestCount],
      ['Theme', p.theme],
    ];
    step3 = [
      ['Budget', `${inr(p.budgetMin)} – ${inr(p.budgetMax)}`],
      ['Notes', p.notes],
    ];
  } else if (form.category === 'performer') {
    const p = form.performer;
    step2 = [
      ['Performer', labelOf(PERFORMER_TYPES, p.performerType)],
      ['Genre', p.genre],
      ['Performers', p.performersCount],
      ['Languages', p.languages],
    ];
    step3 = [
      ['Duration', `${p.durationMinutes} min`],
      ['Sound system', p.soundSystemProvided ? 'We provide it' : 'Performer to bring'],
      ['Budget', `${inr(p.budgetMin)} – ${inr(p.budgetMax)}`],
      ['Notes', p.notes],
    ];
  } else {
    const c = form.crew;
    step2 = c.roles.map((r) => [labelOf(CREW_ROLES, r.role), `× ${r.count}`]);
    step3 = [
      ['Shift', `${c.shiftStart} – ${c.shiftEnd}${c.shiftEnd < c.shiftStart ? ' (next day)' : ''}`],
      ['Experience', labelOf(EXPERIENCE_LEVELS, c.experienceLevel)],
      ['Pay', `${inr(c.ratePerPersonPerDay)} per person / day`],
      ['Notes', c.notes],
    ];
  }

  return (
    <div className="review">
      <Section title="Event basics" step={0} goTo={goTo} rows={basics} />
      <Section title={title2} step={1} goTo={goTo} rows={step2} />
      <Section title={title3} step={2} goTo={goTo} rows={step3} />
    </div>
  );
}
