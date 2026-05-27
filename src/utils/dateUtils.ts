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
