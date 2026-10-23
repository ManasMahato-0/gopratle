import RequirementForm from '@/components/RequirementFormLoader';

export default function Home() {
  return (
    <main className="container">
      <div className="page-head">
        <h1>Post a requirement</h1>
        <p className="muted">Tell us about your event and who you need. Takes about two minutes.</p>
      </div>
      <RequirementForm />
    </main>
  );
}
