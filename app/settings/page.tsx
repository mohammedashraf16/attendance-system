'use client';
import { useState } from 'react';
import { Moon, Sun, Trash2, Download } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Navbar } from '@/components/layout/Navbar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode, loadAll } = useStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleClearAll = async () => {
    const { getDB } = await import('@/lib/db');
    const db = getDB();
    await db.records.clear();
    await db.sessions.clear();
    await db.students.clear();
    await db.groups.clear();
    await loadAll();
    setShowClearConfirm(false);
    showToast('All data cleared.');
  };

  const handleExportBackup = async () => {
    const { getDB } = await import('@/lib/db');
    const db = getDB();
    const groups = await db.groups.toArray();
    const students = await db.students.toArray();
    const sessions = await db.sessions.toArray();
    const records = await db.records.toArray();
    const backup = JSON.stringify({ groups, students, sessions, records }, null, 2);
    const blob = new Blob([backup], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendx-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Backup exported!');
  };

  return (
    <div className="page-enter">
      <Navbar title="Settings" subtitle="App preferences and data management" />
      <div style={{ padding: '24px 20px', maxWidth: 600, margin: '0 auto' }}>

        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Appearance</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Dark Mode</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Toggle dark/light theme</div>
            </div>
            <button
              onClick={toggleDarkMode}
              style={{ width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', background: darkMode ? 'var(--primary)' : 'var(--border)', position: 'relative', transition: 'background 0.2s' }}
            >
              <span style={{ position: 'absolute', top: 3, left: darkMode ? 'calc(100% - 22px)' : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, color: 'var(--text-muted)', fontSize: 13 }}>
            {darkMode ? <Moon size={14} /> : <Sun size={14} />}
            Currently using {darkMode ? 'dark' : 'light'} mode
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>Data Management</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)' }}>All data stored locally in your browser. Never sent to any server.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn-secondary" style={{ justifyContent: 'flex-start', minHeight: 44 }} onClick={handleExportBackup}>
              <Download size={16} /> Export Full Backup (JSON)
            </button>
            <button className="btn-danger" style={{ justifyContent: 'flex-start', minHeight: 44 }} onClick={() => setShowClearConfirm(true)}>
              <Trash2 size={16} /> Clear All Data
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>About AttendX</h3>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8 }}>
            <p style={{ margin: '0 0 6px' }}><strong style={{ color: 'var(--text)' }}>Version:</strong> 1.0.0</p>
            <p style={{ margin: '0 0 6px' }}><strong style={{ color: 'var(--text)' }}>Storage:</strong> IndexedDB (Local)</p>
            <p style={{ margin: '0 0 6px' }}><strong style={{ color: 'var(--text)' }}>Offline:</strong> ✅ Full support</p>
            <p style={{ margin: '0 0 6px' }}><strong style={{ color: 'var(--text)' }}>Auto-save:</strong> ✅ Instant</p>
            <p style={{ margin: 0 }}><strong style={{ color: 'var(--text)' }}>Stack:</strong> Next.js 16 · TypeScript · Dexie.js · Zustand</p>
          </div>
        </div>
      </div>

      {showClearConfirm && (
        <ConfirmModal
          title="Clear All Data"
          message="This will permanently delete ALL groups, students, sessions, and attendance records. Cannot be undone."
          confirmLabel="Clear Everything"
          onConfirm={handleClearAll}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
