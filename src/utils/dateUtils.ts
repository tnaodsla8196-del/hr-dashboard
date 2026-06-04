/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeekRange {
  key: string;      // "1", "2", "3", etc.
  label: string;    // "1주차 (5/4 ~ 5/10)"
  startStr: string; // "2026-05-04"
  endStr: string;   // "2026-05-10"
  startDay: number; // 4
  endDay: number;   // 10
}

/**
 * Calculates weeks (Monday to Sunday) for a given year and month.
 * A week belongs to the given month if its Thursday falls in that month.
 */
export const getWeekRanges = (year: number, month: number): WeekRange[] => {
  const weeks: WeekRange[] = [];
  
  // Start scanning from 7 days before the first day of the month
  const firstOfMonth = new Date(year, month - 1, 1);
  let current = new Date(firstOfMonth);
  current.setDate(current.getDate() - 7);
  
  // Align current to the nearest Monday
  const dayOfWeek = current.getDay(); // 0 = Sun, 1 = Mon, ...
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  current.setDate(current.getDate() - daysToMonday);
  
  const lastOfMonth = new Date(year, month, 0);
  let weekIndex = 1;
  
  // Scan week-by-week
  while (current <= lastOfMonth || (current.getMonth() + 1) === month) {
    const mon = new Date(current);
    
    const sun = new Date(current);
    sun.setDate(sun.getDate() + 6);
    
    const thu = new Date(current);
    thu.setDate(thu.getDate() + 3);
    
    // If the Thursday of this week is in the target month and year, it belongs to this month
    if (thu.getFullYear() === year && (thu.getMonth() + 1) === month) {
      const startStr = formatDate(mon);
      const endStr = formatDate(sun);
      
      const startMonth = mon.getMonth() + 1;
      const startDay = mon.getDate();
      const endMonth = sun.getMonth() + 1;
      const endDay = sun.getDate();
      
      weeks.push({
        key: String(weekIndex),
        label: `${weekIndex}주차 (${startMonth}/${startDay} ~ ${endMonth}/${endDay})`,
        startStr,
        endStr,
        startDay,
        endDay
      });
      weekIndex++;
    }
    
    // Move to next Monday
    current.setDate(current.getDate() + 7);
  }
  
  return weeks;
};

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const KOREAN_HOLIDAYS_2026: Record<string, string> = {
  "2026-01-01": "신정",
  "2026-02-16": "설날 연휴",
  "2026-02-17": "설날",
  "2026-02-18": "설날 연휴",
  "2026-03-01": "삼일절",
  "2026-03-02": "대체공휴일 (삼일절)",
  "2026-05-01": "근로자의 날",
  "2026-05-05": "어린이날",
  "2026-05-24": "부처님오신날",
  "2026-05-25": "대체공휴일 (부처님오신날)",
  "2026-06-06": "현충일",
  "2026-08-15": "광복절",
  "2026-08-17": "대체공휴일 (광복절)",
  "2026-09-24": "추석 연휴",
  "2026-09-25": "추석",
  "2026-09-26": "추석 연휴",
  "2026-10-03": "개천절",
  "2026-10-05": "대체공휴일 (개천절)",
  "2026-10-09": "한글날",
  "2026-12-25": "성탄절"
};

export const getHolidayOrWeekendName = (dateStr: string): string | null => {
  if (!dateStr) return null;
  
  // Normalize date string to YYYY-MM-DD
  let normalized = dateStr.trim();
  if (normalized.length === 8 && !normalized.includes('-')) {
    normalized = `${normalized.substring(0, 4)}-${normalized.substring(4, 6)}-${normalized.substring(6, 8)}`;
  }
  
  if (KOREAN_HOLIDAYS_2026[normalized]) {
    return KOREAN_HOLIDAYS_2026[normalized];
  }
  
  const date = new Date(normalized);
  if (!isNaN(date.getTime())) {
    const day = date.getDay(); // 0 = Sun, 6 = Sat
    if (day === 0) return "일요일";
    if (day === 6) return "토요일";
  }
  return null;
};
