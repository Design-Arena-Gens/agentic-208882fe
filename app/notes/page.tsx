"use client";

import { useEffect, useMemo, useState } from 'react';
import { loadList, saveList, uid } from '@/lib/storage';

interface Note { id: string; title: string; body: string; updatedAt: number }

const STORE_KEY = 'sb.notes.v1';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => { setNotes(loadList<Note>(STORE_KEY, [])); }, []);
  useEffect(() => { saveList(STORE_KEY, notes); }, [notes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(n => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
  }, [notes, query]);

  function addNote() {
    const now = Date.now();
    setNotes([{ id: uid('note'), title: 'Untitled', body: '', updatedAt: now }, ...notes]);
  }

  function update(id: string, patch: Partial<Note>) {
    setNotes(curr => curr.map(n => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)));
  }

  function remove(id: string) { setNotes(curr => curr.filter(n => n.id !== id)); }

  return (
    <main className="list">
      <div className="space-between">
        <h2>Notes</h2>
        <div className="row">
          <input className="input" placeholder="Search?" value={query} onChange={e => setQuery(e.target.value)} />
          <button className="button" onClick={addNote}>New</button>
        </div>
      </div>

      <div className="list">
        {filtered.length === 0 && <div className="card small">No notes yet.</div>}
        {filtered.map(n => (
          <div key={n.id} className="card">
            <div className="space-between">
              <input className="input" value={n.title} onChange={e => update(n.id, { title: e.target.value })} />
              <button className="button danger" onClick={() => remove(n.id)}>Delete</button>
            </div>
            <div style={{ height: 8 }} />
            <textarea className="textarea" value={n.body} onChange={e => update(n.id, { body: e.target.value })} />
            <div className="small" style={{ marginTop: 6 }}>Updated {new Date(n.updatedAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
