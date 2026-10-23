'use client';

import dynamic from 'next/dynamic';

// The form restores its draft from localStorage on first render, which doesn't exist on the
// server, so it's rendered on the client only. Avoids a hydration mismatch.
const RequirementForm = dynamic(() => import('./RequirementForm'), {
  ssr: false,
  loading: () => <div className="card muted">Loading form…</div>,
});

export default RequirementForm;
