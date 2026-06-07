'use client';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Users, ClipboardCheck, TrendingUp, BookOpen, Plus, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Navbar } from '@/components/layout/Navbar';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { groups, students, sessions, loadAll } = useStore();
  useEffect(() => { loadAll(); }, []);

  const todaySessions = useMemo(() => {
    const today = new Date().toDateString();
    return sessions.filter(s => new Date(s.date).toDateString() === today);
  }, [sessions]);

  const statCards = [
    { label: 'Groups', value: groups.length, icon: BookOpen, color: '#2563EB', bg: '#DBEAFE' },
    { label: 'Students', value: students.length, icon: Users, color: '#F97316', bg: '#FED7AA' },
    { label: "Today", value: todaySessions.length, icon: ClipboardCheck, color: '#22C55E', bg: '#DCFCE7' },
    { label: 'Sessions', value: sessions.length, icon: TrendingUp, color: '#8B5CF6', bg: '#EDE9FE' },
  ];

  return (
    <div className="page-enter">
      <Navbar title="Dashboard" subtitle="Welcome back, Instructor" />
      <div style={{ padding: '16px', maxWidth: 900, margin: '0 auto' }}>

        {/* Stat cards 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {statCards.map(card => (
            <div key={card.label} className="card" style={{ padding: '16px' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <card.icon size={18} color={card.color} />
              </div>
              <div style={{ fontSize: 28, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Link href="/groups" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', minHeight: 48, fontSize: 14 }}>
                <Plus size={16} /> New Group
              </button>
            </Link>
            <Link href="/attendance" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', minHeight: 48, fontSize: 14 }}>
                <ClipboardCheck size={16} /> Attendance
              </button>
            </Link>
          </div>
        </div>

        {/* Recent sessions */}
        <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Recent Sessions</h3>
            <Link href="/attendance" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>See all</Link>
          </div>
          {sessions.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ClipboardCheck size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: 14 }}>No sessions yet</p>
            </div>
          ) : sessions.slice(0, 5).map(session => {
            const group = groups.find(g => g.id === session.groupId);
            return (
              <Link key={session.id} href={`/attendance/${session.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: 'var(--primary)', flexShrink: 0 }}>
                  {(group?.name || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group?.name || 'Unknown'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(session.date)}</div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </Link>
            );
          })}
        </div>

        {/* Groups list */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>My Groups</h3>
            <Link href="/groups" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Manage</Link>
          </div>
          {groups.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Users size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: 14 }}>No groups yet</p>
            </div>
          ) : groups.slice(0, 5).map(group => {
            const count = students.filter(s => s.groupId === group.id).length;
            return (
              <Link key={group.id} href={`/groups/${group.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{group.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count} students</div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
