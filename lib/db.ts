import Dexie, { Table } from 'dexie';

export interface Group {
  id?: number;
  name: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id?: number;
  groupId: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceSession {
  id?: number;
  groupId: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecord {
  id?: number;
  sessionId: number;
  studentId: number;
  groupId: number;
  round1: 'present' | 'absent';
  round2: 'present' | 'absent';
  round3: 'present' | 'absent';
  participationScore: number;
  updatedAt: Date;
}

export class AttendanceDB extends Dexie {
  groups!: Table<Group>;
  students!: Table<Student>;
  sessions!: Table<AttendanceSession>;
  records!: Table<AttendanceRecord>;

  constructor() {
    super('AttendanceDB');
    this.version(1).stores({
      groups: '++id, name, createdAt',
      students: '++id, groupId, name, createdAt',
      sessions: '++id, groupId, date, createdAt',
      records: '++id, sessionId, studentId, groupId',
    });
  }
}

let _db: AttendanceDB | null = null;

export function getDB(): AttendanceDB {
  if (!_db) {
    _db = new AttendanceDB();
  }
  return _db;
}
