import Link from 'next/link';

function Tile({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="tile">
      <span className="title">{title}</span>
      <span className="desc">{desc}</span>
    </Link>
  );
}

export default function Page() {
  return (
    <main className="list" style={{ gap: 16 }}>
      <section className="card">
        <h2>Dashboard</h2>
        <p className="small">Your second brain at a glance.</p>
      </section>

      <div className="tile-grid">
        <Tile href="/notes" title="Notes" desc="Capture and organize ideas" />
        <Tile href="/todos" title="To-Do" desc="Tasks and checklists" />
        <Tile href="/reminders" title="Reminders" desc="Don?t miss what matters" />
        <Tile href="/files" title="Files" desc="Keep important docs at hand" />
      </div>

      <section className="card">
        <h3>Tip</h3>
        <p className="small">Tap the chat bubble to brainstorm with AI anywhere.</p>
      </section>
    </main>
  );
}
