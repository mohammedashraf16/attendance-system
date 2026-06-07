import { create } from 'zustand';
import type { Group, Student, AttendanceSession, AttendanceRecord } from '@/lib/db';

// Lazy load db only on client
async function db() {
  const { getDB } = await import('@/lib/db');
  return getDB();
}

interface AppState {
  groups: Group[];
  students: Student[];
  sessions: AttendanceSession[];
  records: AttendanceRecord[];
  sidebarOpen: boolean;
  darkMode: boolean;
  loading: boolean;
  error: string | null;

  addGroup: (name: string, notes?: string) => Promise<Group>;
  updateGroup: (id: number, name: string, notes?: string) => Promise<void>;
  deleteGroup: (id: number) => Promise<void>;

  loadStudents: (groupId?: number) => Promise<void>;
  addStudent: (groupId: number, name: string) => Promise<Student>;
  updateStudent: (id: number, name: string) => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;

  loadSessions: (groupId?: number) => Promise<void>;
  createSession: (groupId: number, notes?: string) => Promise<AttendanceSession>;
  deleteSession: (id: number) => Promise<void>;

  loadRecords: (sessionId: number) => Promise<void>;
  upsertRecord: (record: Omit<AttendanceRecord, 'id' | 'updatedAt'>) => Promise<void>;
  updateParticipation: (sessionId: number, studentId: number, delta: number) => Promise<void>;

  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  loadAll: () => Promise<void>;
  clearError: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  groups: [],
  students: [],
  sessions: [],
  records: [],
  sidebarOpen: false,
  darkMode: false,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const d = await db();
      const [groups, students, sessions] = await Promise.all([
        d.groups.orderBy('createdAt').reverse().toArray(),
        d.students.orderBy('createdAt').toArray(),
        d.sessions.orderBy('date').reverse().toArray(),
      ]);
      set({ groups, students, sessions });
    } catch (e: any) {
      set({ error: `loadAll: ${e?.message || e}` });
    } finally {
      set({ loading: false });
    }
  },

  addGroup: async (name, notes) => {
    try {
      const d = await db();
      const now = new Date();
      const id = await d.groups.add({ name, notes, createdAt: now, updatedAt: now });
      const group = await d.groups.get(id as number) as Group;
      set((s) => ({ groups: [group, ...s.groups] }));
      return group;
    } catch (e: any) {
      set({ error: `addGroup: ${e?.message || e}` });
      throw e;
    }
  },

  updateGroup: async (id, name, notes) => {
    try {
      const d = await db();
      await d.groups.update(id, { name, notes, updatedAt: new Date() });
      set((s) => ({
        groups: s.groups.map((g) => g.id === id ? { ...g, name, notes } : g),
      }));
    } catch (e: any) {
      set({ error: `updateGroup: ${e?.message || e}` });
    }
  },

  deleteGroup: async (id) => {
    try {
      const d = await db();
      const sessions = await d.sessions.where('groupId').equals(id).toArray();
      for (const s of sessions) {
        await d.records.where('sessionId').equals(s.id!).delete();
      }
      await d.sessions.where('groupId').equals(id).delete();
      await d.students.where('groupId').equals(id).delete();
      await d.groups.delete(id);
      set((s) => ({
        groups: s.groups.filter((g) => g.id !== id),
        students: s.students.filter((st) => st.groupId !== id),
        sessions: s.sessions.filter((se) => se.groupId !== id),
      }));
    } catch (e: any) {
      set({ error: `deleteGroup: ${e?.message || e}` });
    }
  },

  loadStudents: async (groupId) => {
    try {
      const d = await db();
      const students = groupId
        ? await d.students.where('groupId').equals(groupId).toArray()
        : await d.students.orderBy('createdAt').toArray();
      set({ students });
    } catch (e: any) {
      set({ error: `loadStudents: ${e?.message || e}` });
    }
  },

  addStudent: async (groupId, name) => {
    try {
      const d = await db();
      const now = new Date();
      const id = await d.students.add({ groupId, name, createdAt: now, updatedAt: now });
      const student = await d.students.get(id as number) as Student;
      set((s) => ({ students: [...s.students, student] }));
      return student;
    } catch (e: any) {
      set({ error: `addStudent: ${e?.message || e}` });
      throw e;
    }
  },

  updateStudent: async (id, name) => {
    try {
      const d = await db();
      await d.students.update(id, { name, updatedAt: new Date() });
      set((s) => ({
        students: s.students.map((st) => st.id === id ? { ...st, name } : st),
      }));
    } catch (e: any) {
      set({ error: `updateStudent: ${e?.message || e}` });
    }
  },

  deleteStudent: async (id) => {
    try {
      const d = await db();
      await d.records.where('studentId').equals(id).delete();
      await d.students.delete(id);
      set((s) => ({ students: s.students.filter((st) => st.id !== id) }));
    } catch (e: any) {
      set({ error: `deleteStudent: ${e?.message || e}` });
    }
  },

  loadSessions: async (groupId) => {
    try {
      const d = await db();
      const sessions = groupId
        ? await d.sessions.where('groupId').equals(groupId).reverse().sortBy('date')
        : await d.sessions.orderBy('date').reverse().toArray();
      set({ sessions });
    } catch (e: any) {
      set({ error: `loadSessions: ${e?.message || e}` });
    }
  },

  createSession: async (groupId, notes) => {
    try {
      const d = await db();
      const now = new Date();
      const id = await d.sessions.add({ groupId, date: now, notes, createdAt: now, updatedAt: now });
      const session = await d.sessions.get(id as number) as AttendanceSession;
      const students = await d.students.where('groupId').equals(groupId).toArray();
      for (const student of students) {
        await d.records.add({
          sessionId: id as number,
          studentId: student.id!,
          groupId,
          round1: 'absent',
          round2: 'absent',
          round3: 'absent',
          participationScore: 0,
          updatedAt: now,
        });
      }
      set((s) => ({ sessions: [session, ...s.sessions] }));
      return session;
    } catch (e: any) {
      set({ error: `createSession: ${e?.message || e}` });
      throw e;
    }
  },

  deleteSession: async (id) => {
    try {
      const d = await db();
      await d.records.where('sessionId').equals(id).delete();
      await d.sessions.delete(id);
      set((s) => ({ sessions: s.sessions.filter((se) => se.id !== id) }));
    } catch (e: any) {
      set({ error: `deleteSession: ${e?.message || e}` });
    }
  },

  loadRecords: async (sessionId) => {
    try {
      const d = await db();
      const records = await d.records.where('sessionId').equals(sessionId).toArray();
      set({ records });
    } catch (e: any) {
      set({ error: `loadRecords: ${e?.message || e}` });
    }
  },

  upsertRecord: async (record) => {
    try {
      const d = await db();
      const existing = await d.records
        .where({ sessionId: record.sessionId, studentId: record.studentId })
        .first();
      const now = new Date();
      if (existing?.id) {
        await d.records.update(existing.id, { ...record, updatedAt: now });
        set((s) => ({
          records: s.records.map((r) =>
            r.id === existing.id ? { ...r, ...record, updatedAt: now } : r
          ),
        }));
      } else {
        const id = await d.records.add({ ...record, updatedAt: now });
        const newRecord = await d.records.get(id as number) as AttendanceRecord;
        set((s) => ({ records: [...s.records, newRecord] }));
      }
    } catch (e: any) {
      set({ error: `upsertRecord: ${e?.message || e}` });
    }
  },

  updateParticipation: async (sessionId, studentId, delta) => {
    try {
      const d = await db();
      const existing = await d.records.where({ sessionId, studentId }).first();
      if (existing?.id) {
        const newScore = Math.max(0, (existing.participationScore || 0) + delta);
        await d.records.update(existing.id, { participationScore: newScore, updatedAt: new Date() });
        set((s) => ({
          records: s.records.map((r) =>
            r.id === existing.id ? { ...r, participationScore: newScore } : r
          ),
        }));
      }
    } catch (e: any) {
      set({ error: `updateParticipation: ${e?.message || e}` });
    }
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
}));
