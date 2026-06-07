'use client';
import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [log, setLog] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const addLog = (msg: string) => setLog(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${msg}`]);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setLog([]);
    setDone(false);

    addLog('Starting tests...');
    addLog(`Browser: ${navigator.userAgent.substring(0, 60)}`);
    addLog(`IndexedDB available: ${!!window.indexedDB}`);

    try {
      // Test 1: Open DB
      addLog('Opening IndexedDB...');
      const { getDB } = await import('@/lib/db');
      const db = getDB();
      addLog('DB opened OK');

      // Test 2: Write
      addLog('Writing test group...');
      const now = new Date();
      const id = await db.groups.add({ name: '__test__', notes: '', createdAt: now, updatedAt: now });
      addLog(`Write OK — id: ${id}`);

      // Test 3: Read
      addLog('Reading back...');
      const g = await db.groups.get(id as number);
      addLog(`Read OK — name: ${g?.name}`);

      // Test 4: Delete
      addLog('Cleaning up...');
      await db.groups.delete(id as number);
      addLog('Delete OK');

      addLog('✅ ALL TESTS PASSED — IndexedDB works fine');
    } catch (err: any) {
      addLog(`❌ ERROR: ${err?.message || String(err)}`);
      addLog(`Stack: ${err?.stack?.substring(0, 200) || 'no stack'}`);
    }

    setDone(true);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>🔍 IndexedDB Debug</h2>
      <button
        onClick={runTests}
        style={{ background: '#2563EB', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', marginBottom: 16, fontSize: 14, minHeight: 44 }}
      >
        Run Tests Again
      </button>
      <div style={{ background: '#0F172A', color: '#94A3B8', padding: 16, borderRadius: 10, lineHeight: 2, fontSize: 13 }}>
        {log.length === 0 && <div>Running...</div>}
        {log.map((line, i) => (
          <div key={i} style={{ color: line.includes('✅') ? '#4ADE80' : line.includes('❌') ? '#F87171' : line.includes('OK') ? '#60A5FA' : '#94A3B8' }}>
            {line}
          </div>
        ))}
      </div>
      {done && (
        <div style={{ marginTop: 16, fontSize: 13, color: '#64748B', fontFamily: 'sans-serif' }}>
          Copy this output and share it to help diagnose the issue.
        </div>
      )}
    </div>
  );
}
