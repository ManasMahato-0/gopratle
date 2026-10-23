import Field from '../Field';
import Icon from '../Icon';
import type { Errors, FormState } from '@/lib/form';
import { todayString } from '@/lib/form';
import { CATEGORIES, EVENT_TYPES } from '@/lib/options';

type Props = {
  form: FormState;
  errors: Errors;
  update: (patch: Partial<FormState>) => void;
};

export default function EventBasics({ form, errors, update }: Props) {
  const today = todayString();

  return (
    <>
      <Field label="Event name" htmlFor="eventName" error={errors.eventName}>
        <input
          id="eventName"
          value={form.eventName}
          maxLength={100}
          placeholder="e.g. Riya & Arjun's Sangeet"
          onChange={(e) => update({ eventName: e.target.value })}
        />
      </Field>

      <Field label="Event type" htmlFor="eventType" error={errors.eventType}>
        <select id="eventType" value={form.eventType} onChange={(e) => update({ eventType: e.target.value })}>
          <option value="">Select…</option>
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={form.multiDay}
          onChange={(e) => update({ multiDay: e.target.checked, endDate: e.target.checked ? form.endDate : '' })}
        />
        Runs for more than one day
      </label>

      <div className="row">
        <Field label={form.multiDay ? 'Start date' : 'Date'} htmlFor="startDate" error={errors.startDate}>
          <input
            id="startDate"
            type="date"
            min={today}
            value={form.startDate}
            onChange={(e) => update({ startDate: e.target.value })}
          />
        </Field>
        {form.multiDay && (
          <Field label="End date" htmlFor="endDate" error={errors.endDate}>
            <input
              id="endDate"
              type="date"
              min={form.startDate || today}
              value={form.endDate}
              onChange={(e) => update({ endDate: e.target.value })}
            />
          </Field>
        )}
      </div>

      <div className="row">
        <Field label="City / location" htmlFor="location" error={errors.location}>
          <input
            id="location"
            value={form.location}
            maxLength={100}
            placeholder="e.g. Pune"
            onChange={(e) => update({ location: e.target.value })}
          />
        </Field>
        <Field label="Venue" htmlFor="venue" optional hint="Leave blank if not decided yet">
          <input
            id="venue"
            value={form.venue}
            maxLength={120}
            onChange={(e) => update({ venue: e.target.value })}
          />
        </Field>
      </div>

      <fieldset className={`field ${errors.category ? 'has-error' : ''}`}>
        <legend>Who are you looking for?</legend>
        <div className="category-grid">
          {CATEGORIES.map((c) => (
            <label key={c.value} className={`category-card ${form.category === c.value ? 'selected' : ''}`}>
              <input
                type="radio"
                name="category"
                value={c.value}
                checked={form.category === c.value}
                onChange={() => update({ category: c.value })}
              />
              <span className="category-icon">
                <Icon name={c.value} size={22} />
              </span>
              <strong>{c.label}</strong>
              <span>{c.hint}</span>
            </label>
          ))}
        </div>
        {errors.category && <p className="error">{errors.category}</p>}
      </fieldset>
    </>
  );
}
