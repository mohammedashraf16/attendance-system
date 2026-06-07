'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Users, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Navbar } from '@/components/layout/Navbar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Modal } from '@/components/ui/Modal';

function GroupForm({ initial, onSubmit, onCancel, title }: {
  initial?: { name: string; notes?: string };
  onSubmit: (name: string, notes: string) => void;
  onCancel: () => void;
  title: string;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [notes, setNotes] = useState(initial?.notes || '');

  return (
    <Modal title={title} onClose={onCancel}>
      <div style={{ padding: '20px 20px 0' }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
          Group Name *
        </label>
        <input
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. G-1042, Math 101..."
          style={{ fontSize: 16, marginBottom: 16 }}
          autoFocus
          onKeyDown={e => e.key === 'Enter' && name.trim() && onSubmit(name.trim(), notes.trim())}
        />
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
          Notes (optional)
        </label>
        <textarea
          className="input"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any notes about this group..."
          rows={3}
          style={{ fontSize: 15, resize: 'none' }}
        />
      </div>
      <div style={{ padding: '16px 20px 20px', display: 'flex', gap: 10 }}>
        <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', minHeight: 48 }}
          onClick={onCancel} onTouchEnd={(e) => { e.preventDefault(); onCancel(); }}>
          Cancel
        </button>
        <button className="btn-primary"
          style={{ flex: 1, justifyContent: 'center', minHeight: 48, opacity: name.trim() ? 1 : 0.5 }}
          onClick={() => name.trim() && onSubmit(name.trim(), notes.trim())}
          onTouchEnd={(e) => { e.preventDefault(); if (name.trim()) onSubmit(name.trim(), notes.trim()); }}
          disabled={!name.trim()}>
          {initial ? 'Save Changes' : 'Create Group'}
        </button>
      </div>
    </Modal>
  );
}

export default function GroupsPage() {
  const { groups, students, sessions, addGroup, updateGroup, deleteGroup, loadAll } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<{ id: number; name: string; notes?: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => { loadAll(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCreate = async (name: string, notes: string) => {
    await addGroup(name, notes); setShowForm(false); showToast('Group created!');
  };
  const handleUpdate = async (name: string, notes: string) => {
    if (!editingGroup) return;
    await updateGroup(editingGroup.id, name, notes); setEditingGroup(null); showToast('Group updated!');
  };
  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteGroup(deletingId); setDeletingId(null); showToast('Group deleted.');
  };

  return (
    <div className="page-enter">
      <Navbar title="Groups" subtitle="Manage your classes" />
      <div style={{ padding: '16px', maxWidth: 900, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
          <button className="btn-primary" style={{ minHeight: 44 }}
            onClick={() => setShowForm(true)}
            onTouchEnd={(e) => { e.preventDefault(); setShowForm(true); }}>
            <Plus size={16} /> New Group
          </button>
        </div>

        {groups.length === 0 && (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Users size={48} color="var(--text-muted)" style={{ marginBottom: 16, opacity: 0.3 }} />
            <h3 style={{ margin: '0 0 8px' }}>No groups yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 20px' }}>Create your first group to get started.</p>
            <button className="btn-primary" style={{ minHeight: 48 }}
              onClick={() => setShowForm(true)}
              onTouchEnd={(e) => { e.preventDefault(); setShowForm(true); }}>
              <Plus size={16} /> Create First Group
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {groups.map(group => {
            const studentCount = students.filter(s => s.groupId === group.id).length;
            const sessionCount = sessions.filter(s => s.groupId === group.id).length;
            return (
              <div key={group.id} className="card" style={{ overflow: 'hidden' }}>
                <Link href={`/groups/${group.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'white', fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.name}</div>
                    {group.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.notes}</div>}
                    <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>👤 {studentCount} students</span>
                      <span style={{ fontSize: 12, color: '#F97316', fontWeight: 600 }}>📋 {sessionCount} sessions</span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                </Link>
                <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
                  <button
                    style={{ flex: 1, padding: '12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRight: '1px solid var(--border)', minHeight: 48, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    onClick={() => setEditingGroup({ id: group.id!, name: group.name, notes: group.notes })}
                    onTouchEnd={(e) => { e.preventDefault(); setEditingGroup({ id: group.id!, name: group.name, notes: group.notes }); }}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    style={{ flex: 1, padding: '12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 48, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    onClick={() => setDeletingId(group.id!)}
                    onTouchEnd={(e) => { e.preventDefault(); setDeletingId(group.id!); }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && <GroupForm title="Create Group" onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
      {editingGroup && <GroupForm title="Edit Group" initial={editingGroup} onSubmit={handleUpdate} onCancel={() => setEditingGroup(null)} />}
      {deletingId && <ConfirmModal title="Delete Group" message="This will permanently delete the group and all its data." onConfirm={handleDelete} onCancel={() => setDeletingId(null)} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
