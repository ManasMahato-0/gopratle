import Field from '../Field';
import type { Errors } from '@/lib/form';

type Props = {
  label: string;
  min: string;
  max: string;
  errors: Errors;
  onChange: (min: string, max: string) => void;
};

export default function BudgetFields({ label, min, max, errors, onChange }: Props) {
  return (
    <fieldset className="field">
      <legend>{label}</legend>
      <div className="row">
        <Field label="From" htmlFor="budgetMin" error={errors.budgetMin}>
          <input
            id="budgetMin"
            type="number"
            min={0}
            step={1000}
            inputMode="numeric"
            value={min}
            onChange={(e) => onChange(e.target.value, max)}
          />
        </Field>
        <Field label="To" htmlFor="budgetMax" error={errors.budgetMax}>
          <input
            id="budgetMax"
            type="number"
            min={0}
            step={1000}
            inputMode="numeric"
            value={max}
            onChange={(e) => onChange(min, e.target.value)}
          />
        </Field>
      </div>
    </fieldset>
  );
}
