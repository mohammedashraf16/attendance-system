'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, Plus, Users, ArrowRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Navbar } from '@/components/layout/Navbar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { formatDate } from '@/lib/utils';

export default function AttendancePage() {
  const { groups, students, sessions, loadAll, createSession, deleteSession } = useStore();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => { loadAll(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleDeleteSession = async () => {
    if (!deletingId) return;
    await deleteSession(deletingId);
    setDeletingId(null);
    showToast('Session deleted.');
  };

  return (
    <div className="page-enter">
      <Navbar title="Attendance" subtitle="Session history and management" />

      <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Groups - quick start */}
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Start New Session</h3>
          {groups.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
              No groups yet. <Link href="/groups" style={{ color: 'var(--primary)' }}>Create a group first →</Link>
            </p>
          ) : (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {groups.map(group => {
                const count = students.filter(s => s.groupId === group.id).length;
                return (
                  <button
                    key={group.id}
                    className="btn-secondary"
                    style={{ gap: 8 }}
                    onClick={async () => {
                      if (count === 0) { showToast('Add students to this group first!'); return; }
                      const session = await createSession(group.id!);
                      router.push(`/attendance/${session.id}`);
                    }}
                  >
                    <Plus size={14} />
                    {group.name}
                    <span className="badge badge-blue" style={{ fontSize: 11 }}>{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sessions history */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>All Sessions ({sessions.length})</h3>
          </div>

          {sessions.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ClipboardCheck size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: 14 }}>No sessions yet. Start one above!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Group</th>
                    <th>Date</th>
                    <th>Notes</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(session => {
                    const group = groups.find(g => g.id === session.groupId);
                    return (
                      <tr key={session.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                              {(group?.name || '?').charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600 }}>{group?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{formatDate(session.date)}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{session.notes || '—'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <Link href={`/attendance/${session.id}`} style={{ textDecoration: 'none' }}>
                              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 13 }}>
                                Open <ArrowRight size={13} />
                              </button>
                            </Link>
                            <button
                              style={{ width: 30, height: 30, border: '1px solid #FEE2E2', borderRadius: 6, background: '#FEE2E2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}
                              onClick={() => setDeletingId(session.id!)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {deletingId && (
        <ConfirmModal
          title="Delete Session"
          message="This will permanently delete the session and all attendance records in it."
          onConfirm={handleDeleteSession}
          onCancel={() => setDeletingId(null)}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
