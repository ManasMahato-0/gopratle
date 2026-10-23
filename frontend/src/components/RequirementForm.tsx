'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import EventBasics from './steps/EventBasics';
import { CrewRoles, CrewShift } from './steps/CrewSteps';
import { PerformanceDetails, PerformerInfo } from './steps/PerformerSteps';
import { PlannerBudget, PlannerServices } from './steps/PlannerSteps';
import Review from './steps/Review';
import { ApiError, createRequirement, type Requirement } from '@/lib/api';
import {
  initialForm,
  toPayload,
  validateStep,
  type CrewForm,
  type Errors,
  type FormState,
  type PerformerForm,
  type PlannerForm,
} from '@/lib/form';
import { CATEGORIES, STEP_TITLES, labelOf } from '@/lib/options';

const DRAFT_KEY = 'requirement-draft';

function loadDraft(): FormState {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return { ...initialForm, ...JSON.parse(raw) };
  } catch {
    // corrupted draft or storage blocked, start fresh
  }
  return initialForm;
}

export default function RequirementForm() {
  const [form, setForm] = useState<FormState>(loadDraft);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [saved, setSaved] = useState<Requirement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (saved) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {}
  }, [form, saved]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const setPlanner = (patch: Partial<PlannerForm>) => setForm((f) => ({ ...f, planner: { ...f.planner, ...patch } }));
  const setPerformer = (patch: Partial<PerformerForm>) =>
    setForm((f) => ({ ...f, performer: { ...f.performer, ...patch } }));
  const setCrew = (patch: Partial<CrewForm>) => setForm((f) => ({ ...f, crew: { ...f.crew, ...patch } }));

  const titles = ['Event basics', ...(form.category ? STEP_TITLES[form.category] : ['Details', 'More details']), 'Review & submit'];

  function next() {
    const e = validateStep(step, form);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => s + 1);
  }

  function back() {
    setErrors({});
    setStep((s) => s - 1);
  }

  function goTo(target: number) {
    setErrors({});
    setStep(target);
  }

  async function submit() {
    // re-check every step, in case a draft from an older version got restored
    for (let s = 0; s < 3; s++) {
      const e = validateStep(s, form);
      if (Object.keys(e).length) {
        setErrors(e);
        setStep(s);
        return;
      }
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createRequirement(toPayload(form));
      setSaved(res.data);
      localStorage.removeItem(DRAFT_KEY);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err : new ApiError('Something went wrong', 0));
    } finally {
      setSubmitting(false);
    }
  }

  function startOver() {
    setForm(initialForm);
    setSaved(null);
    setStep(0);
    setErrors({});
  }

  if (saved) {
    return (
      <div className="card success">
        <h2>Requirement posted</h2>
        <p>
          <strong>{saved.eventName}</strong> is saved under <span className={`badge ${saved.category}`}>
            {labelOf(CATEGORIES, saved.category)}
          </span>
        </p>
        <p className="muted">Reference: {saved._id}</p>
        <div className="actions">
          <button type="button" className="secondary" onClick={startOver}>
            Post another
          </button>
          <Link href={`/requirements?category=${saved.category}`} className="button">
            View all {saved.category} requirements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <ol className="stepper">
        {titles.map((t, i) => (
          <li key={i} className={i === step ? 'current' : i < step ? 'done' : ''}>
            <span>{i + 1}</span>
            {t}
          </li>
        ))}
      </ol>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 3) next();
          else submit();
        }}
      >
        <h2 tabIndex={-1} ref={headingRef}>
          Step {step + 1}: {titles[step]}
        </h2>

        {step === 0 && <EventBasics form={form} errors={errors} update={update} />}

        {step === 1 && form.category === 'planner' && (
          <PlannerServices data={form.planner} errors={errors} set={setPlanner} />
        )}
        {step === 2 && form.category === 'planner' && (
          <PlannerBudget data={form.planner} errors={errors} set={setPlanner} />
        )}

        {step === 1 && form.category === 'performer' && (
          <PerformerInfo data={form.performer} errors={errors} set={setPerformer} />
        )}
        {step === 2 && form.category === 'performer' && (
          <PerformanceDetails data={form.performer} errors={errors} set={setPerformer} />
        )}

        {step === 1 && form.category === 'crew' && <CrewRoles data={form.crew} errors={errors} set={setCrew} />}
        {step === 2 && form.category === 'crew' && <CrewShift data={form.crew} errors={errors} set={setCrew} />}

        {step === 3 && <Review form={form} goTo={goTo} />}

        {submitError && (
          <div className="alert" role="alert">
            <p>{submitError.message}</p>
            {submitError.fields && (
              <ul>
                {Object.entries(submitError.fields).map(([field, msg]) => (
                  <li key={field}>
                    {field}: {msg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="actions">
          {step > 0 && (
            <button type="button" className="secondary" onClick={back} disabled={submitting}>
              Back
            </button>
          )}
          <button type="submit" disabled={submitting}>
            {step < 3 ? 'Next' : submitting ? 'Posting…' : 'Post requirement'}
          </button>
        </div>
      </form>
    </div>
  );
}
