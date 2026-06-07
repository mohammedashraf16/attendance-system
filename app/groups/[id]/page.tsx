'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Trash2, ArrowLeft, ClipboardCheck, Search, UserPlus, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Navbar } from '@/components/layout/Navbar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = Number(params.id);
  const { groups, students, sessions, loadStudents, loadSessions, addStudent, updateStudent, deleteStudent, createSession } = useStore();

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<{ id: number; name: string } | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [editName, setEditName] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'sessions'>('students');

  const group = groups.find(g => g.id === groupId);
  const groupStudents = students.filter(s => s.groupId === groupId);
  const groupSessions = sessions.filter(s => s.groupId === groupId);
  const filtered = groupStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => { loadStudents(groupId); loadSessions(groupId); }, [groupId]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleAddStudent = async () => {
    if (!newName.trim()) return;
    await addStudent(groupId, newName.trim());
    setNewName(''); setShowAddStudent(false);
    showToast('Student added!');
  };
  const handleUpdateStudent = async () => {
    if (!editingStudent || !editName.trim()) return;
    await updateStudent(editingStudent.id, editName.trim());
    setEditingStudent(null); showToast('Student updated!');
  };
  const handleDeleteStudent = async () => {
    if (!deletingStudentId) return;
    await deleteStudent(deletingStudentId);
    setDeletingStudentId(null); showToast('Student removed.');
  };
  const handleNewSession = async () => {
    if (creatingSession || groupStudents.length === 0) return;
    setCreatingSession(true);
    try { const s = await createSession(groupId); router.push(`/attendance/${s.id}`); }
    finally { setCreatingSession(false); }
  };

  if (!group) return (
    <div><Navbar title="Not Found" />
      <div style={{ padding: 20 }}><Link href="/groups"><button className="btn-secondary"><ArrowLeft size={16} /> Back</button></Link></div>
    </div>
  );

  return (
    <div className="page-enter">
      <Navbar title={group.name} subtitle={`${groupStudents.length} students`} />
      <div style={{ padding: '16px', maxWidth: 800, margin: '0 auto' }}>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          <Link href="/groups" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', minHeight: 48, fontSize: 13 }}>
              <ArrowLeft size={15} /> Back
            </button>
          </Link>
          <button className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', minHeight: 48, fontSize: 13 }}
            onClick={() => setShowAddStudent(true)}
            onTouchEnd={(e) => { e.preventDefault(); setShowAddStudent(true); }}>
            <UserPlus size={15} /> Add
          </button>
          <button className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', minHeight: 48, fontSize: 13, opacity: groupStudents.length === 0 ? 0.5 : 1 }}
            onClick={handleNewSession}
            onTouchEnd={(e) => { e.preventDefault(); handleNewSession(); }}
            disabled={creatingSession || groupStudents.length === 0}>
            <ClipboardCheck size={15} /> {creatingSession ? '...' : 'Session'}
          </button>
        </div>

        {groupStudents.length === 0 && (
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#C2410C' }}>⚠️ Add students before creating a session.</p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 12, padding: 4, marginBottom: 16 }}>
          {(['students', 'sessions'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
              {tab === 'students' ? `Students (${groupStudents.length})` : `Sessions (${groupSessions.length})`}
            </button>
          ))}
        </div>

        {/* Students tab */}
        {activeTab === 'students' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search students..." style={{ paddingLeft: 34, fontSize: 15 }} />
              </div>
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ margin: 0, fontSize: 14 }}>{search ? 'No results.' : 'No students yet. Tap Add.'}</p>
              </div>
            ) : filtered.map((student, i) => (
              <div key={student.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{student.name}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ width: 36, height: 36, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                    onClick={() => { setEditingStudent({ id: student.id!, name: student.name }); setEditName(student.name); }}
                    onTouchEnd={(e) => { e.preventDefault(); setEditingStudent({ id: student.id!, name: student.name }); setEditName(student.name); }}>
                    <Edit2 size={14} />
                  </button>
                  <button style={{ width: 36, height: 36, border: '1px solid #FEE2E2', borderRadius: 8, background: '#FEE2E2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}
                    onClick={() => setDeletingStudentId(student.id!)}
                    onTouchEnd={(e) => { e.preventDefault(); setDeletingStudentId(student.id!); }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sessions tab */}
        {activeTab === 'sessions' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            {groupSessions.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <ClipboardCheck size={36} style={{ marginBottom: 10, opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: 14 }}>No sessions yet.</p>
              </div>
            ) : groupSessions.map(session => (
              <Link key={session.id} href={`/attendance/${session.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{formatDate(session.date)}</div>
                  {session.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{session.notes}</div>}
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <Modal title="Add Student" onClose={() => { setShowAddStudent(false); setNewName(''); }}>
          <div style={{ padding: '20px 20px 0' }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              Student Name *
            </label>
            <input className="input" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Student full name" style={{ fontSize: 16 }} autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAddStudent()} />
          </div>
          <div style={{ padding: '16px 20px 20px', display: 'flex', gap: 10 }}>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', minHeight: 48 }}
              onClick={() => { setShowAddStudent(false); setNewName(''); }}
              onTouchEnd={(e) => { e.preventDefault(); setShowAddStudent(false); setNewName(''); }}>Cancel</button>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', minHeight: 48, opacity: newName.trim() ? 1 : 0.5 }}
              onClick={handleAddStudent}
              onTouchEnd={(e) => { e.preventDefault(); handleAddStudent(); }}
              disabled={!newName.trim()}>Add Student</button>
          </div>
        </Modal>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <Modal title="Edit Student" onClose={() => setEditingStudent(null)}>
          <div style={{ padding: '20px 20px 0' }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              Student Name *
            </label>
            <input className="input" value={editName} onChange={e => setEditName(e.target.value)}
              placeholder="Student name" style={{ fontSize: 16 }} autoFocus
              onKeyDown={e => e.key === 'Enter' && handleUpdateStudent()} />
          </div>
          <div style={{ padding: '16px 20px 20px', display: 'flex', gap: 10 }}>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', minHeight: 48 }}
              onClick={() => setEditingStudent(null)}
              onTouchEnd={(e) => { e.preventDefault(); setEditingStudent(null); }}>Cancel</button>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', minHeight: 48, opacity: editName.trim() ? 1 : 0.5 }}
              onClick={handleUpdateStudent}
              onTouchEnd={(e) => { e.preventDefault(); handleUpdateStudent(); }}
              disabled={!editName.trim()}>Save</button>
          </div>
        </Modal>
      )}

      {deletingStudentId && (
        <ConfirmModal title="Remove Student" message="This will remove the student and all their attendance records."
          onConfirm={handleDeleteStudent} onCancel={() => setDeletingStudentId(null)} />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
