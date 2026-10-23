import RequirementForm from '@/components/RequirementFormLoader';

export default function Home() {
  return (
    <main className="container">
      <div className="page-head">
        <p className="eyebrow">New requirement</p>
        <h1>Find the right people for your event</h1>
        <p className="muted">
          Tell us what you&apos;re planning and who you need. Planners, performers and crew see it right
          away.
        </p>
      </div>
      <RequirementForm />
    </main>
  );
}
