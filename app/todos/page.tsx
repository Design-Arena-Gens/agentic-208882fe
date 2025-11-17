"use client";

import { useEffect, useMemo, useState } from 'react';
import { loadList, saveList, uid } from '@/lib/storage';

interface Todo { id: string; text: string; done: boolean; createdAt: number }

const STORE_KEY = 'sb.todos.v1';

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all');

  useEffect(() => { setTodos(loadList<Todo>(STORE_KEY, [])); }, []);
  useEffect(() => { saveList(STORE_KEY, todos); }, [todos]);

  function add() {
    const t = text.trim();
    if (!t) return;
    setTodos([{ id: uid('todo'), text: t, done: false, createdAt: Date.now() }, ...todos]);
    setText('');
  }

  function toggle(id: string) { setTodos(curr => curr.map(td => td.id === id ? { ...td, done: !td.done } : td)); }
  function remove(id: string) { setTodos(curr => curr.filter(td => td.id !== id)); }

  const visible = useMemo(() => {
    if (filter === 'all') return todos;
    if (filter === 'open') return todos.filter(t => !t.done);
    return todos.filter(t => t.done);
  }, [todos, filter]);

  return (
    <main className="list">
      <h2>To-Do</h2>
      <div className="row">
        <input className="input" placeholder="Add a task?" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key==='Enter') add(); }} />
        <button className="button" onClick={add}>Add</button>
      </div>
      <div className="row" style={{ gap: 6 }}>
        <button className={`button ghost ${filter==='all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`button ghost ${filter==='open' ? 'active' : ''}`} onClick={() => setFilter('open')}>Open</button>
        <button className={`button ghost ${filter==='done' ? 'active' : ''}`} onClick={() => setFilter('done')}>Done</button>
      </div>
      <div className="list">
        {visible.length === 0 && <div className="card small">No tasks.</div>}
        {visible.map(t => (
          <div key={t.id} className="card space-between">
            <label className="row" style={{ gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
            </label>
            <button className="button danger" onClick={() => remove(t.id)}>Delete</button>
          </div>
        ))}
      </div>
    </main>
  );
}
