/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Clock, ShieldAlert, AlertTriangle, CheckCircle2, TrendingUp, Users, 
  ChevronDown, ChevronRight, HelpCircle, Calendar, Sparkles, Building2, User
} from 'lucide-react';
import { CommuteRecord, AttendanceRecord, EmployeeStatusRecord, TimeFilterType } from '../types';
import { calculateWeeklyHours, EmployeeWeeklyHours, getWeekRangeForDate } from '../utils/workingHoursUtils';
import { getWeekRanges } from '../utils/dateUtils';

interface WorkingHoursTabProps {
  commuteRecords: CommuteRecord[];
  attendanceRecords: AttendanceRecord[];
  allEmployees: EmployeeStatusRecord[];
  retiredEmployees: Record<string, string>;
  simulatedDate: string;
  selectedDept: string;
  searchQuery: string;
  timeFilter: TimeFilterType;
  selectedMonth: string;
  selectedWeek: string;
}

export const WorkingHoursTab: React.FC<WorkingHoursTabProps> = ({
  commuteRecords,
  attendanceRecords,
  allEmployees,
  retiredEmployees,
  simulatedDate,
  selectedDept,
  searchQuery,
  timeFilter,
  selectedMonth,
  selectedWeek
}) => {
  // Tab State: 'individual' = 개인별 랭킹, 'department' = 부서별 랭킹
  const [subTab, setSubTab] = useState<'individual' | 'department'>('individual');
  // Expanded rows map for individual drill-down
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // 1. Resolve active week range based on filters
  const activeWeekRange = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (timeFilter === 'weekly' && selectedMonth !== 'all' && selectedWeek !== 'all') {
      const monthNum = parseInt(selectedMonth, 10);
      const weekRanges = getWeekRanges(currentYear, monthNum);
      const targetWeek = weekRanges.find(w => w.key === selectedWeek);
      if (targetWeek) {
        return {
          startStr: targetWeek.startStr,
          endStr: targetWeek.endStr,
          label: `2026년 ${selectedMonth}월 ${selectedWeek}주차 (${targetWeek.label.split('(')[1]}`
        };
      }
    }
    
    // Default fallback to week of simulatedDate
    const range = getWeekRangeForDate(simulatedDate);
    return {
      startStr: range.startStr,
      endStr: range.endStr,
      label: `현재 주차 (${range.label})`
    };
  }, [timeFilter, selectedMonth, selectedWeek, simulatedDate]);

  // 2. Compute weekly hours for all employees for the active week
  const weeklyHoursData = useMemo(() => {
    if (allEmployees.length === 0) return [];
    return calculateWeeklyHours(
      commuteRecords,
      attendanceRecords,
      allEmployees,
      retiredEmployees,
      activeWeekRange.startStr,
      activeWeekRange.endStr
    );
  }, [commuteRecords, attendanceRecords, allEmployees, retiredEmployees, activeWeekRange]);

  // 3. Filter and search weekly data based on global filters
  const filteredWeeklyData = useMemo(() => {
    return weeklyHoursData.filter(emp => {
      // Department filter
      if (selectedDept !== 'all' && emp.department !== selectedDept) {
        return false;
      }
      
      // Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesSapId = emp.sapId.toLowerCase().includes(q);
        const matchesDept = emp.department.toLowerCase().includes(q);
        const matchesPos = emp.position.toLowerCase().includes(q);
        
        if (!matchesName && !matchesSapId && !matchesDept && !matchesPos) {
          return false;
        }
      }
      
      return true;
    });
  }, [weeklyHoursData, selectedDept, searchQuery]);

  // 4. Summarize statistics
  const stats = useMemo(() => {
    let dangerCount = 0;
    let warningCount = 0;
    let normalCount = 0;
    let totalHoursSum = 0;
    
    // Calculate stats on filtered data
    filteredWeeklyData.forEach(emp => {
      if (emp.status === '위험') dangerCount++;
      else if (emp.status === '경고') warningCount++;
      else normalCount++;
      
      totalHoursSum += emp.totalHours;
    });
    
    const avgHours = filteredWeeklyData.length > 0 ? (totalHoursSum / filteredWeeklyData.length) : 0;
    
    return {
      dangerCount,
      warningCount,
      normalCount,
      avgHours: Math.round(avgHours * 10) / 10
    };
  }, [filteredWeeklyData]);

  // 5. Individual ranking list sorted by total hours descending
  const sortedIndividuals = useMemo(() => {
    return [...filteredWeeklyData].sort((a, b) => b.totalHours - a.totalHours);
  }, [filteredWeeklyData]);

  // 6. Department summary statistics
  const departmentRankings = useMemo(() => {
    const deptMap: Record<string, {
      deptName: string;
      employeeCount: number;
      totalHoursSum: number;
      maxHours: number;
      maxEmployeeName: string;
      dangerCount: number;
      warningCount: number;
    }> = {};

    weeklyHoursData.forEach(emp => {
      const dept = emp.department;
      if (!deptMap[dept]) {
        deptMap[dept] = {
          deptName: dept,
          employeeCount: 0,
          totalHoursSum: 0,
          maxHours: 0,
          maxEmployeeName: '',
          dangerCount: 0,
          warningCount: 0
        };
      }

      const d = deptMap[dept];
      d.employeeCount++;
      d.totalHoursSum += emp.totalHours;
      if (emp.totalHours > d.maxHours) {
        d.maxHours = emp.totalHours;
        d.maxEmployeeName = emp.name;
      }
      if (emp.status === '위험') d.dangerCount++;
      else if (emp.status === '경고') d.warningCount++;
    });

    return Object.values(deptMap)
      .map(d => ({
        ...d,
        avgHours: d.employeeCount > 0 ? Math.round((d.totalHoursSum / d.employeeCount) * 10) / 10 : 0
      }))
      // Filter department ranking lists based on selectedDept if not 'all'
      .filter(d => selectedDept === 'all' || d.deptName === selectedDept)
      .sort((a, b) => b.avgHours - a.avgHours);
  }, [weeklyHoursData, selectedDept]);

  const toggleRowExpand = (sapId: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [sapId]: !prev[sapId]
    }));
  };

  const getDayName = (dateStr: string) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  return (
    <div id="working-hours-tab" className="space-y-6 animate-fade-in relative">
      
      {/* Alert Header on Default Week Fallback */}
      {timeFilter !== 'weekly' && (
        <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-xl flex items-center gap-2.5 text-xs text-blue-800 shadow-2xs font-medium">
          <HelpCircle className="w-4.5 h-4.5 text-blue-500 shrink-0" />
          <span>
            현재 기준 시점({simulatedDate})이 속한 주간의 데이터가 기본 표시되고 있습니다. 특정 주차의 데이터를 조회하려면 <b>상단 필터에서 '주별'</b>을 선택하십시오.
          </span>
        </div>
      )}

      {/* Summary Scorecards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Card 1: Exceeding 52h (Danger) */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-16 h-16 bg-rose-50 rounded-bl-full flex items-start justify-end p-3 transition-colors group-hover:bg-rose-100/50">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-display">초과근로 위험군 (52h 이상)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-mono text-rose-600 font-display">{stats.dangerCount}</span>
            <span className="text-xs text-rose-500 font-bold">명</span>
          </div>
          <div className="text-[10px] text-slate-450 mt-3 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>즉각적인 근로 감독 및 조정 필요</span>
          </div>
        </div>

        {/* Card 2: Exceeding 45h (Warning) */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-16 h-16 bg-amber-50 rounded-bl-full flex items-start justify-end p-3 transition-colors group-hover:bg-amber-100/50">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-display">초과근로 경고군 (45h ~ 52h)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-mono text-amber-600 font-display">{stats.warningCount}</span>
            <span className="text-xs text-amber-500 font-bold">명</span>
          </div>
          <div className="text-[10px] text-slate-450 mt-3 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>누적 시 주 52시간 제한 초과 우려</span>
          </div>
        </div>

        {/* Card 3: Normal */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-50 rounded-bl-full flex items-start justify-end p-3 transition-colors group-hover:bg-emerald-100/50">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-display">일반 권역군 (45h 미만)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-mono text-emerald-600 font-display">{stats.normalCount}</span>
            <span className="text-xs text-emerald-500 font-bold">명</span>
          </div>
          <div className="text-[10px] text-slate-450 mt-3 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>근로 기준법 안전 준수 영역</span>
          </div>
        </div>

        {/* Card 4: Average Working Hours */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-16 h-16 bg-blue-50 rounded-bl-full flex items-start justify-end p-3 transition-colors group-hover:bg-blue-100/50">
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-display">주간 평균 실근로시간</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-mono text-blue-600 font-display">{stats.avgHours}</span>
            <span className="text-xs text-blue-500 font-bold">시간</span>
          </div>
          <div className="text-[10px] text-slate-450 mt-3 flex items-center gap-1 font-medium font-sans">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">{activeWeekRange.label}</span>
          </div>
        </div>

      </div>

      {/* Main Tab Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Navigation bar inside tab */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">
                실근로시간 및 초과근로 집계 리스트
              </h3>
            </div>
            <p className="text-xs text-slate-450 font-medium">
              더존 출퇴근 기록 및 공식 기안 내역을 교차 집계한 실제 투입 근무시간 데이터입니다. (주 40시간 초과 시 초과근로 집계)
            </p>
          </div>

          {/* Sub-tab Toggle */}
          <div className="flex bg-slate-200/60 p-1.0 rounded-lg self-start sm:self-center">
            <button
              onClick={() => setSubTab('individual')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                subTab === 'individual'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                개인별 랭킹
              </span>
            </button>
            <button
              onClick={() => setSubTab('department')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                subTab === 'department'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                부서별 현황
              </span>
            </button>
          </div>
        </div>

        {/* --- SubTab 1: Individual Ranking Table --- */}
        {subTab === 'individual' && (
          <div>
            {sortedIndividuals.length === 0 ? (
              <div className="p-16 text-center text-slate-450 space-y-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">조회 조건에 부합하는 근로시간 데이터가 없습니다.</p>
                  <p className="text-[11px] text-slate-400">부서 선택 또는 검색어를 확인해 주세요.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed select-text">
                  <thead>
                    <tr className="bg-slate-50/30 text-[10.5px] font-bold text-slate-500 border-b border-slate-200 select-none">
                      <th className="w-[8%] px-5 py-3 text-center">순위</th>
                      <th className="w-[12%] px-5 py-3">사번</th>
                      <th className="w-[12%] px-5 py-3">성명</th>
                      <th className="w-[18%] px-5 py-3">부서</th>
                      <th className="w-[12%] px-5 py-3">직급</th>
                      <th className="w-[12%] px-5 py-3 text-right">기본근로</th>
                      <th className="w-[13%] px-5 py-3 text-right">초과근로</th>
                      <th className="w-[13%] px-5 py-3 text-right">총 합계시간</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {sortedIndividuals.map((emp, index) => {
                      const isExpanded = expandedIds[emp.sapId];
                      
                      let rowBg = 'hover:bg-slate-50/30';
                      if (emp.status === '위험') rowBg = 'bg-rose-50/20 hover:bg-rose-50/40';
                      else if (emp.status === '경고') rowBg = 'bg-amber-50/10 hover:bg-amber-50/20';

                      return (
                        <React.Fragment key={emp.sapId}>
                          {/* Main Row */}
                          <tr 
                            onClick={() => toggleRowExpand(emp.sapId)}
                            className={`transition cursor-pointer select-none ${rowBg}`}
                          >
                            <td className="px-5 py-3.5 text-center font-bold font-mono text-slate-400">
                              {index + 1}
                            </td>
                            <td className="px-5 py-3.5 font-mono font-medium text-slate-600">
                              {emp.sapId}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-900">
                              {emp.name}
                            </td>
                            <td className="px-5 py-3.5 text-slate-700 font-semibold truncate" title={emp.department}>
                              {emp.department}
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 font-medium truncate" title={emp.position}>
                              {emp.position}
                            </td>
                            <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-600">
                              {emp.regularHours}h
                            </td>
                            <td className="px-5 py-3.5 text-right font-mono font-bold text-indigo-600">
                              {emp.overtimeHours > 0 ? `+${emp.overtimeHours}h` : '0h'}
                            </td>
                            <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                              {emp.totalHours}h
                            </td>
                          </tr>

                          {/* Expanded Detail Panel */}
                          {isExpanded && (
                            <tr className="bg-slate-50/40 select-text">
                              <td colSpan={8} className="px-8 py-4 border-t border-b border-slate-200/60">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                      <span>[사번: {emp.sapId}] {emp.name} {emp.position} — 일자별 근로 상세 현황</span>
                                    </h4>
                                    <span className="text-[10px] text-slate-450 font-medium font-sans">
                                      집계 기준: 출근 독려용 미출근 자동화 예외 조건 포함
                                    </span>
                                  </div>

                                  {/* Detailed Day-by-Day Grid */}
                                  <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
                                    {(Object.entries(emp.dailyHours) as [string, { hours: number; isTrip: boolean; isLeave: boolean; startTime: string; endTime: string }][]).map(([dayStr, detail]) => {
                                      const dayName = getDayName(dayStr);
                                      const datePart = dayStr.split('-').slice(1).join('/'); // MM/DD
                                      
                                      let cellBg = 'bg-white border-slate-200/80';
                                      let statusLabel = '무기록';
                                      let statusColor = 'text-slate-400';
                                      
                                      if (detail.hours > 0) {
                                        if (detail.isTrip) {
                                          cellBg = 'bg-indigo-50/30 border-indigo-200/60';
                                          statusLabel = '공식 출장';
                                          statusColor = 'text-indigo-600 font-bold';
                                        } else {
                                          cellBg = 'bg-white border-slate-200/80';
                                          statusLabel = `${detail.startTime} ~ ${detail.endTime || '보정'}`;
                                          statusColor = 'text-slate-600 font-semibold font-mono';
                                        }
                                      } else if (detail.isLeave) {
                                        cellBg = 'bg-blue-50/30 border-blue-200/50';
                                        statusLabel = '공식 휴가';
                                        statusColor = 'text-blue-600 font-bold';
                                      }

                                      return (
                                        <div 
                                          key={dayStr}
                                          className={`p-3 border rounded-xl flex flex-col items-center justify-between text-center min-h-[90px] shadow-3xs ${cellBg}`}
                                        >
                                          <div>
                                            <span className="text-[10.5px] font-bold text-slate-700 block font-sans">
                                              {datePart} ({dayName})
                                            </span>
                                            <span className={`text-[9.5px] mt-1.5 block ${statusColor}`}>
                                              {statusLabel}
                                            </span>
                                          </div>
                                          
                                          <div className="border-t border-slate-100 w-full pt-1.5 mt-2 flex justify-between items-baseline px-1">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Work</span>
                                            <span className="text-xs font-bold font-mono text-slate-800">
                                              {Math.round(detail.hours * 100) / 100}h
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Detailed Metrics Badge */}
                                  <div className="flex gap-4 text-[10.5px] text-slate-500 bg-slate-100/60 p-2.5 rounded-lg border border-slate-200/40 select-none">
                                    <span className="font-semibold">집계 지표 요약:</span>
                                    <span>출퇴근(태깅) 근무일: <b className="text-slate-800 font-bold font-mono">{emp.metrics.commuteDays}일</b></span>
                                    <span>•</span>
                                    <span>출장 간주(일 8h) 근무일: <b className="text-indigo-600 font-bold font-mono">{emp.metrics.tripDays}일</b></span>
                                    <span>•</span>
                                    <span>공식 승인 휴가일: <b className="text-blue-600 font-bold font-mono">{emp.metrics.leaveDays}일</b></span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- SubTab 2: Department Summary Table --- */}
        {subTab === 'department' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto select-text">
              <thead>
                <tr className="bg-slate-50/30 text-[10.5px] font-bold text-slate-500 border-b border-slate-200 select-none">
                  <th className="w-12 px-5 py-3 text-center">순위</th>
                  <th className="px-5 py-3">부서명</th>
                  <th className="px-5 py-3 text-center">소속 인원수</th>
                  <th className="px-5 py-3 text-right">평균 주간 근로시간</th>
                  <th className="px-5 py-3 text-right">최고 근로시간 사원</th>
                  <th className="px-5 py-3 text-center">52h 위험군 인원</th>
                  <th className="px-5 py-3 text-center">초과근로 주의비율</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {departmentRankings.map((dept, index) => {
                  const dangerPct = dept.employeeCount > 0 
                    ? Math.round(((dept.dangerCount + dept.warningCount) / dept.employeeCount) * 100) 
                    : 0;

                  let barColor = 'bg-emerald-500';
                  let textColor = 'text-emerald-700';
                  if (dept.dangerCount > 0) {
                    barColor = 'bg-rose-500';
                    textColor = 'text-rose-700';
                  } else if (dept.warningCount > 0) {
                    barColor = 'bg-amber-500';
                    textColor = 'text-amber-700';
                  }

                  return (
                    <tr key={dept.deptName} className="hover:bg-slate-50/30 transition">
                      <td className="px-5 py-3.5 text-center font-bold font-mono text-slate-400">
                        {index + 1}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">
                        {dept.deptName}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-600">
                        {dept.employeeCount}명
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-800 text-sm">
                        {dept.avgHours}h
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="font-bold text-slate-850">{dept.maxEmployeeName}</span>
                          <span className="text-[10px] font-mono font-semibold text-slate-450">{dept.maxHours}h</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                          dept.dangerCount > 0 
                            ? 'bg-rose-100 text-rose-700 border border-rose-200/50' 
                            : 'bg-slate-100 text-slate-450 border border-slate-200/40'
                        }`}>
                          {dept.dangerCount > 0 ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          ) : null}
                          <span>위험 {dept.dangerCount}명</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-24 bg-slate-100 rounded-full h-2.0 overflow-hidden border border-slate-200/40 shrink-0">
                            <div 
                              className={`h-full rounded-full transition-all duration-350 ${barColor}`}
                              style={{ width: `${Math.min(100, Math.max(5, dangerPct))}%` }}
                            />
                          </div>
                          <span className={`font-mono font-bold text-[10px] text-right w-8 shrink-0 ${textColor}`}>
                            {dangerPct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
      
    </div>
  );
};
