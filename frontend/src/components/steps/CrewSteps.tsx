import Field from '../Field';
import type { CrewForm, CrewRole, Errors } from '@/lib/form';
import { CREW_ROLES, EXPERIENCE_LEVELS } from '@/lib/options';

type Props = {
  data: CrewForm;
  errors: Errors;
  set: (patch: Partial<CrewForm>) => void;
};

export function CrewRoles({ data, errors, set }: Props) {
  const updateRole = (index: number, patch: Partial<CrewRole>) =>
    set({ roles: data.roles.map((r, i) => (i === index ? { ...r, ...patch } : r)) });

  const removeRole = (index: number) => set({ roles: data.roles.filter((_, i) => i !== index) });

  const addRole = () => set({ roles: [...data.roles, { role: '', count: '1' }] });

  return (
    <fieldset className="field">
      <legend>Which roles do you need, and how many of each?</legend>

      {data.roles.map((r, i) => (
        <div className="role-row" key={i}>
          <Field label="Role" htmlFor={`role-${i}`} error={errors[`roles.${i}.role`]}>
            <select id={`role-${i}`} value={r.role} onChange={(e) => updateRole(i, { role: e.target.value })}>
              <option value="">Select…</option>
              {CREW_ROLES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Count" htmlFor={`count-${i}`} error={errors[`roles.${i}.count`]}>
            <input
              id={`count-${i}`}
              type="number"
              min={1}
              inputMode="numeric"
              value={r.count}
              onChange={(e) => updateRole(i, { count: e.target.value })}
            />
          </Field>
          <button
            type="button"
            className="link-button"
            onClick={() => removeRole(i)}
            disabled={data.roles.length === 1}
            aria-label={`Remove role ${i + 1}`}
          >
            Remove
          </button>
        </div>
      ))}

      {data.roles.length < CREW_ROLES.length && (
        <button type="button" className="secondary" onClick={addRole}>
          + Add another role
        </button>
      )}
      {errors.roles && <p className="error">{errors.roles}</p>}
    </fieldset>
  );
}

export function CrewShift({ data, errors, set }: Props) {
  const overnight = data.shiftStart && data.shiftEnd && data.shiftEnd < data.shiftStart;

  return (
    <>
      <div className="row">
        <Field label="Shift starts" htmlFor="shiftStart" error={errors.shiftStart}>
          <input
            id="shiftStart"
            type="time"
            value={data.shiftStart}
            onChange={(e) => set({ shiftStart: e.target.value })}
          />
        </Field>
        <Field
          label="Shift ends"
          htmlFor="shiftEnd"
          error={errors.shiftEnd}
          hint={overnight ? 'Ends the next day' : undefined}
        >
          <input id="shiftEnd" type="time" value={data.shiftEnd} onChange={(e) => set({ shiftEnd: e.target.value })} />
        </Field>
      </div>

      <div className="row">
        <Field label="Experience" htmlFor="experienceLevel">
          <select
            id="experienceLevel"
            value={data.experienceLevel}
            onChange={(e) => set({ experienceLevel: e.target.value })}
          >
            {EXPERIENCE_LEVELS.map((x) => (
              <option key={x.value} value={x.value}>
                {x.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Pay per person per day (₹)" htmlFor="rate" error={errors.ratePerPersonPerDay}>
          <input
            id="rate"
            type="number"
            min={0}
            step={100}
            inputMode="numeric"
            value={data.ratePerPersonPerDay}
            onChange={(e) => set({ ratePerPersonPerDay: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Notes" htmlFor="notes" optional>
        <textarea
          id="notes"
          rows={3}
          maxLength={1000}
          value={data.notes}
          placeholder="Dress code, reporting point, meals provided…"
          onChange={(e) => set({ notes: e.target.value })}
        />
      </Field>
    </>
  );
}
