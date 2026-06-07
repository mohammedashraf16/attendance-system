'use client';
import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Trophy, Users, TrendingUp, Filter } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Navbar } from '@/components/layout/Navbar';
import { calculateAttendancePercentage, downloadCSV } from '@/lib/utils';

export default function ReportsPage() {
  const { groups, students, sessions, loadAll } = useStore();
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadAll();
    import('@/lib/db').then(({ getDB }) => {
      getDB().records.toArray().then(setAllRecords);
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filteredStudents = useMemo(() =>
    selectedGroup === 'all' ? students : students.filter(s => s.groupId === selectedGroup),
    [students, selectedGroup]);

  const filteredSessions = useMemo(() =>
    selectedGroup === 'all' ? sessions : sessions.filter(s => s.groupId === selectedGroup),
    [sessions, selectedGroup]);

  const studentStats = useMemo(() => {
    return filteredStudents.map(student => {
      const recs = allRecords.filter(r => r.studentId === student.id);
      const totalScore = recs.reduce((a: number, r: any) => a + (r.participationScore || 0), 0);
      const totalRounds = recs.length * 3;
      const presentRounds = recs.reduce((a: number, r: any) =>
        a + [r.round1, r.round2, r.round3].filter((x: string) => x === 'present').length, 0);
      const attendancePct = totalRounds > 0 ? Math.round((presentRounds / totalRounds) * 100) : 0;
      return { ...student, totalScore, attendancePct, sessionCount: recs.length };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [filteredStudents, allRecords]);

  const groupChartData = useMemo(() => {
    return groups.map(g => {
      const gr = allRecords.filter(r => r.groupId === g.id);
      const total = gr.length * 3;
      const present = gr.reduce((a: number, r: any) =>
        a + [r.round1, r.round2, r.round3].filter((x: string) => x === 'present').length, 0);
      return {
        name: g.name.length > 8 ? g.name.slice(0, 8) + '…' : g.name,
        fullName: g.name,
        students: students.filter(s => s.groupId === g.id).length,
        sessions: sessions.filter(s => s.groupId === g.id).length,
        attendance: total > 0 ? Math.round((present / total) * 100) : 0,
      };
    });
  }, [groups, students, sessions, allRecords]);

  const handleExportAll = () => {
    const data = studentStats.map((s, i) => ({
      '#': i + 1, 'Student': s.name,
      'Group': groups.find(g => g.id === s.groupId)?.name || '',
      'Total Score': s.totalScore, 'Attendance %': s.attendancePct + '%',
      'Sessions': s.sessionCount,
    }));
    downloadCSV(data, 'attendance-report');
    showToast('Report exported!');
  };

  const COLORS = ['#2563EB', '#F97316', '#22C55E', '#8B5CF6', '#EF4444', '#F59E0B'];

  return (
    <div className="page-enter">
      <Navbar title="Reports" subtitle="Analytics and statistics" />

      <div style={{ padding: '16px', maxWidth: 900, margin: '0 auto' }}>

        {/* Filter + Export row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Filter size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select className="input" value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              style={{ paddingLeft: 30, fontSize: 14 }}>
              <option value="all">All Groups</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={handleExportAll} style={{ flexShrink: 0, minHeight: 44 }}>
            <Download size={15} /> Export
          </button>
        </div>

        {/* Summary cards — 2x2 grid on mobile */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Students', value: filteredStudents.length, color: '#2563EB', bg: '#DBEAFE', icon: Users },
            { label: 'Sessions', value: filteredSessions.length, color: '#F97316', bg: '#FED7AA', icon: TrendingUp },
            {
              label: 'Avg Attendance',
              value: studentStats.length > 0 ? Math.round(studentStats.reduce((a, s) => a + s.attendancePct, 0) / studentStats.length) + '%' : '—',
              color: '#22C55E', bg: '#DCFCE7', icon: TrendingUp,
            },
            { label: 'Top Score', value: studentStats[0]?.totalScore ?? 0, color: '#8B5CF6', bg: '#EDE9FE', icon: Trophy },
          ].map(c => (
            <div key={c.label} className="card" style={{ padding: '16px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <c.icon size={18} color={c.color} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>{c.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Charts — stacked on mobile */}
        {groupChartData.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>

            {/* Bar chart — full width */}
            <div className="card" style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>Attendance % by Group</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={groupChartData} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v, n, p) => [`${v}%`, p.payload.fullName]}
                  />
                  <Bar dataKey="attendance" name="Attendance" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart — full width */}
            {groupChartData.length > 1 && (
              <div className="card" style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>Students per Group</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={groupChartData} dataKey="students" nameKey="fullName"
                      cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                      {groupChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 8, justifyContent: 'center' }}>
                  {groupChartData.map((g, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-muted)' }}>{g.fullName} ({g.students})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rankings */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={16} color="#F59E0B" />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Student Rankings</h3>
          </div>

          {studentStats.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No data yet.</div>
          ) : (
            studentStats.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                {/* Rank */}
                <div style={{ width: 32, textAlign: 'center', fontSize: 16, flexShrink: 0 }}>
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>#{i + 1}</span>}
                </div>
                {/* Name + group */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{groups.find(g => g.id === s.groupId)?.name} · {s.sessionCount} sessions</div>
                </div>
                {/* Attendance badge */}
                <span style={{
                  padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, flexShrink: 0,
                  background: s.attendancePct >= 67 ? '#DCFCE7' : s.attendancePct >= 34 ? '#FEF3C7' : '#FEE2E2',
                  color: s.attendancePct >= 67 ? '#16A34A' : s.attendancePct >= 34 ? '#D97706' : '#EF4444',
                }}>{s.attendancePct}%</span>
                {/* Score */}
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>{s.totalScore}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
