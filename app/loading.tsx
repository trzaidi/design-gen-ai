export default function Loading() {
  return <div className="page" aria-busy="true">
    <div className="skeleton-header" />
    <main className="interior-page">
      <p className="eyebrow loading-label">Loading the archive…</p>
      <div className="skeleton-title" />
      <div className="arena-grid">{[0, 1, 2].map((key) => <div className="arena-card skeleton-card" key={key}><div className="skeleton-image" /><div className="skeleton-line" /><div className="skeleton-line short" /></div>)}</div>
    </main>
  </div>;
}
