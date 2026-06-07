'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Search, Trophy, CheckCircle, XCircle, Filter } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Navbar } from '@/components/layout/Navbar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

import { formatDate, calculateAttendancePercentage, downloadCSV } from '@/lib/utils';

type SortMode = 'default' | 'score_desc' | 'score_asc' | 'attendance_desc' | 'attendance_asc';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = Number(params.id);

  const { groups, students, sessions, records, loadAll, loadRecords, upsertRecord, updateParticipation, deleteSession } = useStore();

  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const session = sessions.find(s => s.id === sessionId);
  const group = session ? groups.find(g => g.id === session.groupId) : null;
  const groupStudents = session ? students.filter(s => s.groupId === session.groupId) : [];

  useEffect(() => {
    loadAll().then(() => loadRecords(sessionId));
  }, [sessionId]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  const getRecord = (studentId: number) =>
    records.find(r => r.sessionId === sessionId && r.studentId === studentId);

  const toggleRound = async (studentId: number, round: 'round1' | 'round2' | 'round3') => {
    const rec = getRecord(studentId);
    const current = rec?.[round] || 'absent';
    const next = current === 'present' ? 'absent' : 'present';
    await upsertRecord({
      sessionId,
      studentId,
      groupId: session!.groupId,
      round1: rec?.round1 || 'absent',
      round2: rec?.round2 || 'absent',
      round3: rec?.round3 || 'absent',
      participationScore: rec?.participationScore || 0,
      [round]: next,
    });
  };

  const handleScore = async (studentId: number, delta: number) => {
    await updateParticipation(sessionId, studentId, delta);
  };

  const handleExportCSV = () => {
    const data = groupStudents.map((student, i) => {
      const rec = getRecord(student.id!);
      return {
        '#': i + 1,
        'Student Name': student.name,
        'Round 1': rec?.round1 || 'absent',
        'Round 2': rec?.round2 || 'absent',
        'Round 3': rec?.round3 || 'absent',
        'Attendance %': calculateAttendancePercentage(rec?.round1 || 'absent', rec?.round2 || 'absent', rec?.round3 || 'absent') + '%',
        'Participation Score': rec?.participationScore || 0,
      };
    });
    downloadCSV(data, `${group?.name || 'group'}-${formatDate(session!.date)}`);
    showToast('CSV exported!');
  };

  const handleDelete = async () => {
    await deleteSession(sessionId);
    router.push('/attendance');
  };

  // Compute filtered+sorted students
  const displayStudents = useMemo(() => {
    let list = groupStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    if (sortMode === 'score_desc') list = [...list].sort((a, b) => (getRecord(b.id!)?.participationScore || 0) - (getRecord(a.id!)?.participationScore || 0));
    else if (sortMode === 'score_asc') list = [...list].sort((a, b) => (getRecord(a.id!)?.participationScore || 0) - (getRecord(b.id!)?.participationScore || 0));
    else if (sortMode === 'attendance_desc') list = [...list].sort((a, b) => {
      const ra = getRecord(a.id!); const rb = getRecord(b.id!);
      return calculateAttendancePercentage(rb?.round1||'present',rb?.round2||'present',rb?.round3||'present') - calculateAttendancePercentage(ra?.round1||'present',ra?.round2||'present',ra?.round3||'present');
    });
    else if (sortMode === 'attendance_asc') list = [...list].sort((a, b) => {
      const ra = getRecord(a.id!); const rb = getRecord(b.id!);
      return calculateAttendancePercentage(ra?.round1||'present',ra?.round2||'present',ra?.round3||'present') - calculateAttendancePercentage(rb?.round1||'present',rb?.round2||'present',rb?.round3||'present');
    });
    return list;
  }, [groupStudents, search, sortMode, records, sessionId]);

  // Top 5 by participation
  const topStudents = useMemo(() => {
    return [...groupStudents]
      .map(s => ({ student: s, score: getRecord(s.id!)?.participationScore || 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [groupStudents, records, sessionId]);

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

  if (!session) return (
    <div>
      <Navbar title="Session Not Found" />
      <div style={{ padding: 24 }}><Link href="/attendance"><button className="btn-secondary"><ArrowLeft size={16} /> Back</button></Link></div>
    </div>
  );

  return (
    <div className="page-enter">
      <Navbar title={`${group?.name || 'Session'} — Attendance`} subtitle={formatDate(session.date)} />

      <div style={{ padding: '16px 20px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <Link href={`/groups/${session.groupId}`} style={{ textDecoration: 'none' }}>
            <button className="btn-secondary"><ArrowLeft size={16} /> {group?.name}</button>
          </Link>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={handleExportCSV}><Download size={14} /> Export CSV</button>
            <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>Delete Session</button>
          </div>
        </div>

        {/* Top Students Bar */}
        {topStudents.some(t => t.score > 0) && (
          <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Trophy size={16} color="#F59E0B" />
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Top Participants</h3>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {topStudents.filter(t => t.score > 0).map((t, i) => (
                <div key={t.student.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-secondary)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600 }}>
                  <span>{medals[i]}</span>
                  <span>{t.student.name}</span>
                  <span style={{ background: '#FEF3C7', color: '#D97706', borderRadius: 99, padding: '1px 8px', fontSize: 12 }}>{t.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search + Sort */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." style={{ paddingLeft: 32 }} />
          </div>
          <select
            className="input"
            value={sortMode}
            onChange={e => setSortMode(e.target.value as SortMode)}
            style={{ width: 'auto', minWidth: 180 }}
          >
            <option value="default">Default Order</option>
            <option value="score_desc">Highest Score</option>
            <option value="score_asc">Lowest Score</option>
            <option value="attendance_desc">Best Attendance</option>
            <option value="attendance_asc">Worst Attendance</option>
          </select>
        </div>

        {/* Main Attendance Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Student Name</th>
                  <th style={{ textAlign: 'center' }}>Round 1</th>
                  <th style={{ textAlign: 'center' }}>Round 2</th>
                  <th style={{ textAlign: 'center' }}>Round 3</th>
                  <th style={{ textAlign: 'center' }}>Attendance</th>
                  <th style={{ textAlign: 'center', minWidth: 160 }}>Participation Score</th>
                </tr>
              </thead>
              <tbody>
                {displayStudents.map((student, i) => {
                  const rec = getRecord(student.id!);
                  const r1 = rec?.round1 || 'absent';
                  const r2 = rec?.round2 || 'absent';
                  const r3 = rec?.round3 || 'absent';
                  const pct = calculateAttendancePercentage(r1, r2, r3);
                  const score = rec?.participationScore || 0;

                  return (
                    <tr key={student.id}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, minWidth: 140 }}>{student.name}</td>

                      {/* Round buttons */}
                      {(['round1', 'round2', 'round3'] as const).map((round) => {
                        const val = rec?.[round] || 'absent';
                        return (
                          <td key={round} style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => toggleRound(student.id!, round)}
                              style={{
                                width: 38, height: 38, borderRadius: 8, border: 'none', cursor: 'pointer',
                                background: val === 'present' ? '#DCFCE7' : '#FEE2E2',
                                color: val === 'present' ? '#16A34A' : '#EF4444',
                                fontSize: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                              }}
                              title={val === 'present' ? 'Click to mark absent' : 'Click to mark present'}
                            >
                              {val === 'present' ? '✓' : '✗'}
                            </button>
                          </td>
                        );
                      })}

                      {/* Attendance % */}
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                          background: pct >= 67 ? '#DCFCE7' : pct >= 34 ? '#FEF3C7' : '#FEE2E2',
                          color: pct >= 67 ? '#16A34A' : pct >= 34 ? '#D97706' : '#EF4444',
                        }}>
                          {pct}%
                        </span>
                      </td>

                      {/* Participation Score */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <button
                            onClick={() => handleScore(student.id!, -1)}
                            disabled={score <= 0}
                            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: score > 0 ? '#FEE2E2' : 'var(--bg-secondary)', color: score > 0 ? '#EF4444' : 'var(--text-muted)', cursor: score > 0 ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >−</button>
                          <span style={{ width: 32, textAlign: 'center', fontWeight: 800, fontSize: 16, fontFamily: 'Syne, sans-serif', color: score > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{score}</span>
                          <button
                            onClick={() => handleScore(student.id!, 1)}
                            style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#DBEAFE', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >+</button>
                          <button
                            onClick={() => handleScore(student.id!, 2)}
                            style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#EDE9FE', color: '#7C3AED', cursor: 'pointer', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >+2</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {displayStudents.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No students found.
            </div>
          )}
        </div>

        {/* Session Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 16 }}>
          {(() => {
            const presentCounts = groupStudents.map(s => {
              const r = getRecord(s.id!);
              return [r?.round1, r?.round2, r?.round3].filter(x => x === 'present').length;
            });
            const totalPresent = presentCounts.reduce((a, b) => a + b, 0);
            const maxPossible = groupStudents.length * 3;
            const avgScore = groupStudents.length > 0
              ? (groupStudents.reduce((a, s) => a + (getRecord(s.id!)?.participationScore || 0), 0) / groupStudents.length).toFixed(1)
              : '0';
            return [
              { label: 'Total Students', value: groupStudents.length, color: '#2563EB' },
              { label: 'Avg Attendance', value: maxPossible > 0 ? Math.round((totalPresent / maxPossible) * 100) + '%' : '—', color: '#22C55E' },
              { label: 'Avg Score', value: avgScore, color: '#F97316' },
              { label: 'Total Score', value: groupStudents.reduce((a, s) => a + (getRecord(s.id!)?.participationScore || 0), 0), color: '#8B5CF6' },
            ];
          })().map(stat => (
            <div key={stat.label} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Session"
          message="This will permanently delete this attendance session and all records. Cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {toast && (
        <div className="toast" style={{ background: toastType === 'error' ? '#EF4444' : undefined }}>
          {toast}
        </div>
      )}
    </div>
  );
}
