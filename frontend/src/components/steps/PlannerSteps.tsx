import Field from '../Field';
import BudgetFields from './BudgetFields';
import type { Errors, PlannerForm } from '@/lib/form';
import { PLANNER_SERVICES } from '@/lib/options';

type Props = {
  data: PlannerForm;
  errors: Errors;
  set: (patch: Partial<PlannerForm>) => void;
};

export function PlannerServices({ data, errors, set }: Props) {
  const toggle = (value: string) =>
    set({
      services: data.services.includes(value)
        ? data.services.filter((s) => s !== value)
        : [...data.services, value],
    });

  return (
    <>
      <fieldset className={`field ${errors.services ? 'has-error' : ''}`}>
        <legend>What do you need help with?</legend>
        <div className="chips">
          {PLANNER_SERVICES.map((s) => (
            <label key={s.value} className={`chip ${data.services.includes(s.value) ? 'selected' : ''}`}>
              <input type="checkbox" checked={data.services.includes(s.value)} onChange={() => toggle(s.value)} />
              {s.label}
            </label>
          ))}
        </div>
        {errors.services && <p className="error">{errors.services}</p>}
      </fieldset>

      <div className="row">
        <Field label="Expected guests" htmlFor="guestCount" error={errors.guestCount}>
          <input
            id="guestCount"
            type="number"
            min={1}
            inputMode="numeric"
            value={data.guestCount}
            onChange={(e) => set({ guestCount: e.target.value })}
          />
        </Field>
        <Field label="Theme" htmlFor="theme" optional>
          <input
            id="theme"
            value={data.theme}
            maxLength={100}
            placeholder="e.g. Rustic, Royal Rajasthani"
            onChange={(e) => set({ theme: e.target.value })}
          />
        </Field>
      </div>
    </>
  );
}

export function PlannerBudget({ data, errors, set }: Props) {
  return (
    <>
      <BudgetFields
        label="Overall budget for planning (₹)"
        min={data.budgetMin}
        max={data.budgetMax}
        errors={errors}
        onChange={(budgetMin, budgetMax) => set({ budgetMin, budgetMax })}
      />
      <Field label="Anything else the planner should know?" htmlFor="notes" optional>
        <textarea
          id="notes"
          rows={4}
          maxLength={1000}
          value={data.notes}
          onChange={(e) => set({ notes: e.target.value })}
        />
      </Field>
    </>
  );
}
