import type { StoredUser } from "./auth";

export type AttendanceRecord = {
  id: string;
  userEmail: string;
  userName: string;
  joinedAt: string;
  dayKey: string;
};

const ATTENDANCE_STORAGE_KEY = "attendanceRecords";

function canUseStorage() {
  return typeof window !== "undefined";
}

function getDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function readAttendanceRecords(): AttendanceRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  const rawRecords = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
  if (!rawRecords) {
    return [];
  }

  try {
    const parsedRecords = JSON.parse(rawRecords);
    return Array.isArray(parsedRecords) ? parsedRecords : [];
  } catch {
    return [];
  }
}

function writeAttendanceRecords(records: AttendanceRecord[]) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
}

export function markAttendance(user: StoredUser) {
  const records = readAttendanceRecords();
  const dayKey = getDayKey();

  const existingRecord = records.find(
    (record) => record.userEmail === user.email && record.dayKey === dayKey
  );

  if (existingRecord) {
    return existingRecord;
  }

  const nextRecord: AttendanceRecord = {
    id: `${user.email}-${dayKey}`,
    userEmail: user.email,
    userName: user.name,
    joinedAt: new Date().toISOString(),
    dayKey,
  };

  writeAttendanceRecords([nextRecord, ...records]);

  return nextRecord;
}

export function getAttendanceByUser(email: string) {
  return readAttendanceRecords().filter((record) => record.userEmail === email);
}

export function getTodayAttendance() {
  const dayKey = getDayKey();
  return readAttendanceRecords().filter((record) => record.dayKey === dayKey);
}

export function hasCheckedInToday(email: string) {
  const dayKey = getDayKey();
  return readAttendanceRecords().some(
    (record) => record.userEmail === email && record.dayKey === dayKey
  );
}
