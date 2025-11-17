"use client";

import { useEffect, useMemo, useRef, useState } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

export function ChatOverlay() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(
    'sb.chat.messages',
    [{ role: 'system', content: 'You are Second Brain, a concise and helpful assistant.' }]
  );
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const visibleMessages = useMemo(() => messages.filter(m => m.role !== 'system'), [messages]);

  async function send() {
    const text = input.trim();
    if (!text || pending) return;
    setInput('');
    const next = [...messages, { role: 'user', content: text } as ChatMessage];
    setMessages(next);
    setPending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-12) })
      });
      const data = await res.json();
      setMessages(curr => [...curr, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setMessages(curr => [...curr, { role: 'assistant', content: 'I hit a snag connecting. Try again.' }]);
    } finally {
      setPending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div className="chat-fab">
      {!open && (
        <button aria-label="Open chat" className="fab" onClick={() => setOpen(true)}>??</button>
      )}
      {open && (
        <div className="chat-panel">
          <div className="space-between" style={{ alignItems: 'center' }}>
            <strong>Second Brain</strong>
            <button className="button ghost" onClick={() => setOpen(false)}>Close</button>
          </div>
          <hr className="sep" />
          <div ref={viewportRef} className="messages">
            {visibleMessages.length === 0 && (
              <div className="small">Start the conversation. Ask for a plan, summary, or ideas.</div>
            )}
            {visibleMessages.map((m, i) => (
              <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'ai'}`}>{m.content}</div>
            ))}
          </div>
          <div className="row" style={{ gap: 8 }}>
            <textarea
              className="textarea"
              placeholder="Type a message?"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button className="button" onClick={() => void send()} disabled={pending}>
              {pending ? '?' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
