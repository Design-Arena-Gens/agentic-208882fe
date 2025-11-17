"use client";

import { useEffect, useState } from 'react';
import { loadList, saveList, uid } from '@/lib/storage';

interface FileItem { id: string; name: string; size: number; type: string; dataUrl: string; addedAt: number }

const STORE_KEY = 'sb.files.v1';

export default function FilesPage() {
  const [items, setItems] = useState<FileItem[]>([]);

  useEffect(() => { setItems(loadList<FileItem>(STORE_KEY, [])); }, []);
  useEffect(() => { saveList(STORE_KEY, items); }, [items]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newItems: FileItem[] = [];
    for (const f of Array.from(files)) {
      // Limit ~2MB per file to avoid localStorage blowups
      if (f.size > 2 * 1024 * 1024) continue;
      const dataUrl = await fileToDataUrl(f);
      newItems.push({ id: uid('file'), name: f.name, size: f.size, type: f.type, dataUrl, addedAt: Date.now() });
    }
    setItems(curr => [...newItems, ...curr]);
    e.currentTarget.value = '';
  }

  function remove(id: string) { setItems(curr => curr.filter(i => i.id !== id)); }

  return (
    <main className="list">
      <h2>Files</h2>
      <div className="row">
        <input type="file" multiple onChange={onUpload} />
      </div>

      <div className="list">
        {items.length === 0 && <div className="card small">No files uploaded.</div>}
        {items.map(i => (
          <div key={i.id} className="card space-between">
            <div>
              <div>{i.name}</div>
              <div className="small">{(i.size/1024).toFixed(1)} KB ? {i.type || 'unknown'}</div>
            </div>
            <div className="row">
              <a className="button ghost" href={i.dataUrl} download={i.name}>Download</a>
              <button className="button danger" onClick={() => remove(i.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
