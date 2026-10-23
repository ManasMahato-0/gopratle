import Field from '../Field';
import BudgetFields from './BudgetFields';
import type { Errors, PerformerForm } from '@/lib/form';
import { PERFORMER_TYPES } from '@/lib/options';

type Props = {
  data: PerformerForm;
  errors: Errors;
  set: (patch: Partial<PerformerForm>) => void;
};

export function PerformerInfo({ data, errors, set }: Props) {
  return (
    <>
      <Field label="Type of performer" htmlFor="performerType" error={errors.performerType}>
        <select
          id="performerType"
          value={data.performerType}
          onChange={(e) => set({ performerType: e.target.value })}
        >
          <option value="">Select…</option>
          {PERFORMER_TYPES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="row">
        <Field label="Genre / style" htmlFor="genre" optional>
          <input
            id="genre"
            value={data.genre}
            maxLength={60}
            placeholder="e.g. Bollywood, Sufi, EDM"
            onChange={(e) => set({ genre: e.target.value })}
          />
        </Field>
        <Field label="How many performers?" htmlFor="performersCount" error={errors.performersCount}>
          <input
            id="performersCount"
            type="number"
            min={1}
            inputMode="numeric"
            value={data.performersCount}
            onChange={(e) => set({ performersCount: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Preferred languages" htmlFor="languages" optional>
        <input
          id="languages"
          value={data.languages}
          maxLength={100}
          placeholder="e.g. Hindi, English"
          onChange={(e) => set({ languages: e.target.value })}
        />
      </Field>
    </>
  );
}

export function PerformanceDetails({ data, errors, set }: Props) {
  return (
    <>
      <Field label="Performance length (minutes)" htmlFor="durationMinutes" error={errors.durationMinutes}>
        <input
          id="durationMinutes"
          type="number"
          min={10}
          step={15}
          inputMode="numeric"
          value={data.durationMinutes}
          onChange={(e) => set({ durationMinutes: e.target.value })}
        />
      </Field>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={data.soundSystemProvided}
          onChange={(e) => set({ soundSystemProvided: e.target.checked })}
        />
        Sound system will be arranged by us
      </label>

      <BudgetFields
        label="Budget for the performance (₹)"
        min={data.budgetMin}
        max={data.budgetMax}
        errors={errors}
        onChange={(budgetMin, budgetMax) => set({ budgetMin, budgetMax })}
      />

      <Field label="Notes" htmlFor="notes" optional>
        <textarea
          id="notes"
          rows={3}
          maxLength={1000}
          value={data.notes}
          placeholder="Song requests, dress code, stage size…"
          onChange={(e) => set({ notes: e.target.value })}
        />
      </Field>
    </>
  );
}
