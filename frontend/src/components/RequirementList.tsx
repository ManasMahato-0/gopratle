'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from './Icon';
import { listRequirements, type Requirement } from '@/lib/api';
import {
  CATEGORIES,
  CREW_ROLES,
  EVENT_TYPES,
  PERFORMER_TYPES,
  PLANNER_SERVICES,
  labelOf,
  type Category,
} from '@/lib/options';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function summary(r: Requirement) {
  const d = r.details;
  switch (r.category) {
    case 'planner':
      return `${d.guestCount} guests · ${d.services.map((s: string) => labelOf(PLANNER_SERVICES, s)).join(', ')}`;
    case 'performer':
      return `${labelOf(PERFORMER_TYPES, d.performerType)}${d.genre ? ` (${d.genre})` : ''} · ${d.durationMinutes} min`;
    case 'crew':
      return d.roles.map((x: { role: string; count: number }) => `${x.count} × ${labelOf(CREW_ROLES, x.role)}`).join(', ');
  }
}

export default function RequirementList() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const raw = params.get('category');
  const category = CATEGORIES.some((c) => c.value === raw) ? (raw as Category) : undefined;

  const [page, setPage] = useState(1);
  const [state, setState] = useState<{
    key: string; // which category/page this result belongs to
    items: Requirement[];
    total: number;
    limit: number;
    error: string;
  }>({ key: '', items: [], total: 0, limit: 10, error: '' });

  const key = `${category ?? 'all'}:${page}`;
  const loading = state.key !== key;

  useEffect(() => {
    let cancelled = false;
    listRequirements({ category, page })
      .then((res) => {
        if (!cancelled) setState({ key, items: res.data, total: res.total, limit: res.limit, error: '' });
      })
      .catch((err) => {
        if (!cancelled) setState((s) => ({ ...s, key, items: [], error: err.message }));
      });
    return () => {
      cancelled = true;
    };
  }, [category, page, key]);

  function pickCategory(value?: Category) {
    setPage(1);
    router.replace(value ? `${pathname}?category=${value}` : pathname);
  }

  const pages = Math.max(1, Math.ceil(state.total / state.limit));

  return (
    <>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={!category} className={!category ? 'active' : ''} onClick={() => pickCategory()}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            role="tab"
            aria-selected={category === c.value}
            className={category === c.value ? 'active' : ''}
            onClick={() => pickCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {state.error && <div className="alert">{state.error}</div>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && !state.error && state.items.length === 0 && (
        <p className="muted">Nothing posted here yet.</p>
      )}

      <ul className="requirement-list">
        {state.items.map((r) => (
          <li key={r._id} className={`card requirement ${r.category}`}>
            <span className="category-icon">
              <Icon name={r.category} />
            </span>
            <div className="requirement-body">
              <div className="list-head">
                <h3>{r.eventName}</h3>
                <span className={`badge ${r.category}`}>{labelOf(CATEGORIES, r.category)}</span>
              </div>
              <p className="meta">
                <span>{labelOf(EVENT_TYPES, r.eventType)}</span>
                <span>
                  {formatDate(r.startDate)}
                  {r.endDate && ` – ${formatDate(r.endDate)}`}
                </span>
                <span className="meta-place">
                  <Icon name="pin" size={14} />
                  {r.location}
                  {r.venue && `, ${r.venue}`}
                </span>
              </p>
              <p>{summary(r)}</p>
            </div>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <div className="actions">
          <button className="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span className="muted">
            Page {page} of {pages}
          </span>
          <button className="secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </>
  );
}
