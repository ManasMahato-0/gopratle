import { Suspense } from 'react';
import RequirementList from '@/components/RequirementList';

export const metadata = { title: 'Requirements | GoPratle' };

export default function RequirementsPage() {
  return (
    <main className="container">
      <div className="page-head">
        <h1>Posted requirements</h1>
      </div>
      {/* RequirementList reads the ?category= param, which needs a Suspense boundary */}
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <RequirementList />
      </Suspense>
    </main>
  );
}
