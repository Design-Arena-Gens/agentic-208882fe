"use client";

import { useEffect, useRef, useState } from 'react';
import { loadList, saveList, uid } from '@/lib/storage';

interface Reminder { id: string; title: string; at: number; done: boolean }

const STORE_KEY = 'sb.reminders.v1';

function requestNotifPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState('');
  const [when, setWhen] = useState<string>('');
  const timersRef = useRef<Record<string, number>>({});

  useEffect(() => { setReminders(loadList<Reminder>(STORE_KEY, [])); }, []);
  useEffect(() => { saveList(STORE_KEY, reminders); }, [reminders]);
  useEffect(() => { requestNotifPermission(); }, []);

  useEffect(() => {
    // Clear existing timers
    Object.values(timersRef.current).forEach(id => window.clearTimeout(id));
    timersRef.current = {};
    // Schedule new timers for upcoming reminders
    const now = Date.now();
    reminders.filter(r => !r.done && r.at > now).forEach(r => {
      const delay = r.at - now;
      const id = window.setTimeout(() => {
        try { if ('Notification' in window && Notification.permission === 'granted') new Notification(r.title); } catch {}
        setReminders(curr => curr.map(x => x.id === r.id ? { ...x, done: true } : x));
      }, Math.min(delay, 2 ** 31 - 1));
      timersRef.current[r.id] = id;
    });
  }, [reminders]);

  function add() {
    const t = title.trim();
    if (!t || !when) return;
    const at = new Date(when).getTime();
    if (!isFinite(at)) return;
    setReminders([{ id: uid('rem'), title: t, at, done: false }, ...reminders]);
    setTitle(''); setWhen('');
  }

  function remove(id: string) { setReminders(curr => curr.filter(r => r.id !== id)); }
  function toggle(id: string) { setReminders(curr => curr.map(r => r.id === id ? { ...r, done: !r.done } : r)); }

  return (
    <main className="list">
      <h2>Reminders</h2>
      <div className="row">
        <input className="input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input className="input" type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} />
        <button className="button" onClick={add}>Add</button>
      </div>

      <div className="list">
        {reminders.length === 0 && <div className="card small">No reminders.</div>}
        {reminders.map(r => (
          <div key={r.id} className="card space-between">
            <div className="row" style={{ gap: 10 }}>
              <input type="checkbox" checked={r.done} onChange={() => toggle(r.id)} />
              <div>
                <div>{r.title}</div>
                <div className="small">{new Date(r.at).toLocaleString()}</div>
              </div>
            </div>
            <button className="button danger" onClick={() => remove(r.id)}>Delete</button>
          </div>
        ))}
      </div>
    </main>
  );
}
