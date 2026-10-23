import type { ReactNode } from 'react';

type Props = {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
};

export default function Field({ label, htmlFor, error, hint, optional, children }: Props) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={htmlFor}>
        {label}
        {optional && <span className="optional"> (optional)</span>}
      </label>
      {children}
      {error ? <p className="error">{error}</p> : hint && <p className="hint">{hint}</p>}
    </div>
  );
}
