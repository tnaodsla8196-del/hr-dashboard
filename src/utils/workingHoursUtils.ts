/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommuteRecord, AttendanceRecord, EmployeeStatusRecord } from '../types';

/**
 * Parses time string (HH:MM or H:MM) into total minutes from midnight.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.trim()) return 0;
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

/**
 * Formats minutes from midnight into HH:MM string format.
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Finds the Monday date string (YYYY-MM-DD) for a given date.
 * Handles both YYYY-MM-DD and YYYYMMDD formats.
 */
export function getMondayStr(dateStr: string): string {
  if (!dateStr) return '';
  
  // Normalize date string to YYYY-MM-DD
  let normalized = dateStr.trim();
  if (normalized.length === 8 && !normalized.includes('-')) {
    normalized = `${normalized.substring(0, 4)}-${normalized.substring(4, 6)}-${normalized.substring(6, 8)}`;
  }
  
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return '';

  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  // Calculate difference to Monday: Sunday needs to go back 6 days, Monday 0 days, Tuesday 1 day, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const d = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get the Monday to Sunday range for a date.
 */
export function getWeekRangeForDate(dateStr: string): { startStr: string; endStr: string; label: string } {
  const monStr = getMondayStr(dateStr);
  if (!monStr) return { startStr: '', endStr: '', label: '기간 미정' };
  
  const mon = new Date(monStr);
  const sun = new Date(mon);
  sun.setDate(sun.getDate() + 6);
  
  const y = sun.getFullYear();
  const m = String(sun.getMonth() + 1).padStart(2, '0');
  const d = String(sun.getDate()).padStart(2, '0');
  const sunStr = `${y}-${m}-${d}`;
  
  const startParts = monStr.split('-');
  const endParts = sunStr.split('-');
  const label = `${parseInt(startParts[1])}/${parseInt(startParts[2])} ~ ${parseInt(endParts[1])}/${parseInt(endParts[2])}`;
  
  return {
    startStr: monStr,
    endStr: sunStr,
    label
  };
}

/**
 * Computes daily actual hours worked from check-in/out logs.
 * Subtracts break times:
 * - 1.0 hour for shifts >= 8 hours
 * - 0.5 hours for shifts >= 4 hours and < 8 hours
 * Adjusts missing clock-out (endTime is empty):
 * - Center or Startup team: 19:00
 * - Other teams: 18:00
 */
export function calculateDailyHours(startTimeStr: string, endTimeStr: string, department: string): number {
  if (!startTimeStr || !startTimeStr.trim()) return 0;
  
  const startMin = parseTimeToMinutes(startTimeStr);
  let endMin = 0;
  
  if (endTimeStr && endTimeStr.trim()) {
    endMin = parseTimeToMinutes(endTimeStr);
  } else {
    // Missing clock-out fallback logic
    const dept = department || '';
    const isCenterOrStartup = dept.includes('센터') || dept.includes('창업지원팀');
    const limitMinutes = isCenterOrStartup ? 600 : 540; // 10:00 vs 09:00 limit
    
    // If they checked in late or are in Center/Startup team, assume standard 10:00~19:00 shift
    if (isCenterOrStartup || startMin >= 570) { // 09:30 is 570
      endMin = 1140; // 19:00
    } else {
      endMin = 1080; // 18:00
    }
  }
  
  if (endMin <= startMin) return 0;
  
  const totalMinutes = endMin - startMin;
  const totalHours = totalMinutes / 60.0;
  
  // Deduct unpaid break time
  if (totalHours >= 8.0) {
    return totalHours - 1.0;
  } else if (totalHours >= 4.0) {
    return totalHours - 0.5;
  }
  return totalHours;
}

export interface EmployeeWeeklyHours {
  sapId: string;
  name: string;
  department: string;
  position: string;
  dailyHours: { [dateStr: string]: { hours: number; isTrip: boolean; isLeave: boolean; startTime: string; endTime: string } };
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  status: '위험' | '경고' | '정상';
  metrics: {
    commuteDays: number;
    tripDays: number;
    leaveDays: number;
  };
}

/**
 * Aggregates working hours for a single week (monStr to sunStr).
 */
export function calculateWeeklyHours(
  commuteRecords: CommuteRecord[],
  attendanceRecords: AttendanceRecord[],
  allEmployees: EmployeeStatusRecord[],
  retiredEmployees: Record<string, string>,
  weekStartStr: string,
  weekEndStr: string
): EmployeeWeeklyHours[] {
  // 1. Resolve date parameters into YYYYMMDD and Date formats
  const startDb = weekStartStr.replace(/-/g, '');
  const endDb = weekEndStr.replace(/-/g, '');
  
  // Generate list of 7 days in the week
  const daysList: string[] = [];
  const currentDate = new Date(weekStartStr);
  for (let i = 0; i < 7; i++) {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    daysList.push(`${y}-${m}-${d}`);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // 2. Filter active employees (excluding Gangnam-gu Office, Conversion Management Part, Executive Office, and retired employees)
  const activeEmployees = allEmployees.filter(emp => {
    const dept = emp.department || '';
    if (
      dept.includes('강남구청점') ||
      dept.includes('전환관리파트') ||
      dept.includes('임원실')
    ) {
      return false;
    }
    
    // Retirement check
    const retireStr = retiredEmployees[emp.name.trim()];
    if (retireStr && weekStartStr >= retireStr) {
      return false; // retired before this week
    }

    // Join check: If the employee hasn't joined by the end of this week, they are not active for this week
    if (emp.joinDate && emp.joinDate.trim()) {
      const joinStr = emp.joinDate.trim();
      if (joinStr > weekEndStr) {
        return false; // joined after this week
      }
    }
    
    return true;
  });

  // Index commute records by sapId and date for faster lookup
  // date in DB is YYYYMMDD
  const commuteLookup = new Map<string, CommuteRecord>();
  commuteRecords.forEach(c => {
    if (c.sapId && c.date) {
      commuteLookup.set(`${c.sapId.trim()}_${c.date.trim()}`, c);
    }
  });

  // Filter approved leaves/trips that fall into this week
  const approvedRecords = attendanceRecords.filter(r => r.status === '결재종결');

  // 3. Process each employee
  return activeEmployees.map(emp => {
    const sapId = emp.sapId.trim();
    const name = emp.name.trim();
    const dept = emp.department.trim();
    const pos = emp.position.trim();
    
    const dailyHours: EmployeeWeeklyHours['dailyHours'] = {};
    let totalHours = 0;
    
    let commuteDays = 0;
    let tripDays = 0;
    let leaveDays = 0;

    daysList.forEach(dayStr => {
      // Check if employee is retired by this specific day
      const retireStr = retiredEmployees[name];
      if (retireStr && dayStr >= retireStr) {
        dailyHours[dayStr] = { hours: 0, isTrip: false, isLeave: false, startTime: '', endTime: '' };
        return;
      }

      // Check if employee has joined by this specific day
      if (emp.joinDate && emp.joinDate.trim()) {
        const joinStr = emp.joinDate.trim();
        if (dayStr < joinStr) {
          dailyHours[dayStr] = { hours: 0, isTrip: false, isLeave: false, startTime: '', endTime: '' };
          return;
        }
      }

      const dbDateStr = dayStr.replace(/-/g, '');
      const lookupKey = `${sapId}_${dbDateStr}`;
      const commute = commuteLookup.get(lookupKey);

      // Check approved leaves and trips for this specific day
      const dailyApproved = approvedRecords.filter(r => {
        // Name check or SAP ID check
        const nameMatch = r.name && r.name.trim() === name;
        const sapMatch = r.sapId && r.sapId.trim() === sapId;
        if (!nameMatch && !sapMatch) return false;
        
        return dayStr >= r.startDate && dayStr <= r.endDate;
      });

      const isTrip = dailyApproved.some(r => r.category === '출장');
      const isLeave = dailyApproved.some(r => r.category === '법정휴가' || r.category === '기타휴가');

      let hours = 0;
      let startTime = '';
      let endTime = '';

      if (commute && commute.startTime) {
        // If there is actual commute tagging, prioritize it
        hours = calculateDailyHours(commute.startTime, commute.endTime, dept);
        startTime = commute.startTime;
        endTime = commute.endTime;
        commuteDays++;
      } else if (isTrip) {
        // No commute tag, but approved business trip -> counts as 8 hours work
        hours = 8.0;
        tripDays++;
      } else if (isLeave) {
        // Approved leave day -> 0 working hours
        hours = 0.0;
        leaveDays++;
      }

      dailyHours[dayStr] = { hours, isTrip, isLeave, startTime, endTime };
      totalHours += hours;
    });

    const regularHours = Math.min(40, totalHours);
    const overtimeHours = Math.max(0, totalHours - 40);
    
    let status: EmployeeWeeklyHours['status'] = '정상';
    if (totalHours >= 52) {
      status = '위험';
    } else if (totalHours >= 45) {
      status = '경고';
    }

    return {
      sapId,
      name,
      department: dept,
      position: pos,
      dailyHours,
      totalHours: Math.round(totalHours * 100) / 100, // round to 2 decimal places
      regularHours: Math.round(regularHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      status,
      metrics: {
        commuteDays,
        tripDays,
        leaveDays
      }
    };
  });
}
