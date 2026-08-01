"use client";
import { FormEvent, useEffect, useState } from "react";

type Document = { document_id: string; filename: string; chunks: number };
type Source = { filename: string; page: number | null; chunk: string; score: number };
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Upload a document to begin.");

  async function refresh() {
    const response = await fetch(`${API}/api/documents`);
    if (response.ok) setDocuments(await response.json());
  }
  useEffect(() => { refresh().catch(() => setMessage("Backend is not reachable.")); }, []);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage("Indexing document...");
    try {
      const response = await fetch(`${API}/api/documents`, { method: "POST", body: form });
      if (!response.ok) throw new Error((await response.json()).detail || "Upload failed");
      const result = await response.json();
      setMessage(`Indexed ${result.filename} into ${result.chunks} chunks.`);
      event.currentTarget.reset(); await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed"); }
    finally { setBusy(false); }
  }

  async function ask(event: FormEvent) {
    event.preventDefault(); if (!question.trim()) return;
    setBusy(true); setAnswer(""); setSources([]);
    try {
      const response = await fetch(`${API}/api/query`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, top_k: 5 }) });
      if (!response.ok) throw new Error("Query failed");
      const result = await response.json(); setAnswer(result.answer); setSources(result.sources);
    } catch (error) { setAnswer(error instanceof Error ? error.message : "Query failed"); }
    finally { setBusy(false); }
  }

  return <main>
    <header><span className="eyebrow">RETRIEVAL · REASONING · CITATIONS</span><h1>DocIntel <em>AI</em></h1><p>Turn documents into grounded, traceable answers.</p></header>
    <section className="grid">
      <aside className="panel">
        <h2>Knowledge base</h2>
        <form onSubmit={upload}><label className="drop"><input name="file" type="file" accept=".pdf,.docx,.txt,.md" required />Choose PDF, DOCX, MD, or TXT</label><button disabled={busy}>Upload & index</button></form>
        <p className="status">{message}</p>
        <div className="docs">{documents.map(doc => <div className="doc" key={doc.document_id}><span>▤</span><div><strong>{doc.filename}</strong><small>{doc.chunks} chunks</small></div></div>)}</div>
      </aside>
      <section className="panel chat">
        <h2>Ask your documents</h2>
        <div className="answer">{answer || <span className="placeholder">Your grounded answer will appear here, with evidence.</span>}</div>
        {sources.length > 0 && <div className="sources"><h3>Sources</h3>{sources.map((s, i) => <details key={i}><summary>[{i + 1}] {s.filename}{s.page ? ` · page ${s.page}` : ""} · {Math.round(s.score * 100)}%</summary><p>{s.chunk}</p></details>)}</div>}
        <form className="ask" onSubmit={ask}><input value={question} onChange={e => setQuestion(e.target.value)} placeholder="What does the document say about…" /><button disabled={busy || documents.length === 0}>Ask</button></form>
      </section>
    </section>
  </main>;
}
