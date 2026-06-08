/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, CheckCircle2, AlertCircle, ShieldAlert, Activity, TrendingUp } from 'lucide-react';
import { AttendanceRecord, CommuteRecord, EmployeeStatusRecord } from '../types';

interface MainOverviewTabProps {
  records: AttendanceRecord[];
  allRecords: AttendanceRecord[];
  simulatedDate: string;
  commuteRecords?: CommuteRecord[];
  allEmployees?: EmployeeStatusRecord[];
  retiredEmployees?: Record<string, string>;
}

export const MainOverviewTab: React.FC<MainOverviewTabProps> = ({ 
  records, 
  allRecords, 
  simulatedDate, 
  commuteRecords = [],
  allEmployees = [],
  retiredEmployees = {}
}) => {
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<string | null>(null);

  // --- CHART 1: Donut Chart Calculations (근태구분 비율) ---
  const typeCounts: { [key: string]: number } = {};
  records.forEach(v => {
    let typeName = v.type;
    if (typeName.includes('반차')) typeName = '반차';
    
    typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
  });

  const totalTypeSum = Object.values(typeCounts).reduce((a, b) => a + b, 0);

  const chartSegments = Object.entries(typeCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalTypeSum > 0 ? (count / totalTypeSum) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);

  const palette = [
    { fill: '#2563eb', hover: '#1d4ed8', text: 'text-blue-600', bg: 'bg-blue-600' },       // Royal Blue
    { fill: '#4f46e5', hover: '#4338ca', text: 'text-indigo-600', bg: 'bg-indigo-600' },   // Indigo
    { fill: '#0d9488', hover: '#0f766e', text: 'text-teal-600', bg: 'bg-teal-600' },       // Teal
    { fill: '#10b981', hover: '#059669', text: 'text-emerald-600', bg: 'bg-emerald-500' }, // Emerald
    { fill: '#ea580c', hover: '#c2410c', text: 'text-orange-600', bg: 'bg-orange-500' },   // Deep Orange
    { fill: '#d97706', hover: '#b45309', text: 'text-amber-600', bg: 'bg-amber-500' },     // Amber
  ];

  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  // --- CALCULATE: Department-wise Annual Leave Usage Rates ---
  // Unique employee map per department, using master list and filtering by active status at simulatedDate
  const deptEmployeeMap = React.useMemo(() => {
    const map: Record<string, Set<string>> = {};
    
    // If allEmployees is not provided (fallback), scan allRecords
    if (!allEmployees || allEmployees.length === 0) {
      allRecords.forEach(rec => {
        if (rec.sapId && rec.department) {
          const dept = rec.department.trim() || '미정';
          if (dept.includes('강남구청점') || dept.includes('전환관리파트') || dept.includes('임원실')) return;
          if (!map[dept]) map[dept] = new Set();
          map[dept].add(rec.sapId);
        }
      });
      return map;
    }

    allEmployees.forEach(emp => {
      const dept = emp.department?.trim() || '미정';
      if (dept.includes('강남구청점') || dept.includes('전환관리파트') || dept.includes('임원실')) return;

      // Retirement check
      const retireDate = retiredEmployees?.[emp.name.trim()] || emp.retirementDate;
      if (retireDate && retireDate.trim() && simulatedDate >= retireDate.trim()) {
        return; // Retired by simulatedDate
      }

      // Join date check
      if (emp.joinDate && emp.joinDate.trim() && simulatedDate < emp.joinDate.trim()) {
        return; // Not joined yet by simulatedDate
      }

      if (!map[dept]) map[dept] = new Set();
      map[dept].add(emp.sapId.trim());
    });

    return map;
  }, [allEmployees, retiredEmployees, allRecords, simulatedDate]);

  const activeMonth = React.useMemo(() => {
    if (simulatedDate) {
      const parts = simulatedDate.split('-');
      if (parts.length >= 2) {
        return parseInt(parts[1]);
      }
    }
    return new Date().getMonth() + 1;
  }, [simulatedDate]);

  const targetRate = React.useMemo(() => {
    return (activeMonth / 12) * 100;
  }, [activeMonth]);

  const deptLeaveStats = React.useMemo(() => {
    const stats: Record<string, { used: number; employeeCount: number; allocated: number; rate: number; deviation: number }> = {};
    
    // Initialize stats
    Object.keys(deptEmployeeMap).forEach((dept) => {
      const employees = deptEmployeeMap[dept];
      const employeeCount = employees.size;
      const allocated = employeeCount * 15; // 15 days standard
      stats[dept] = { used: 0, employeeCount, allocated, rate: 0, deviation: 0 };
    });

    // Sum used leave days
    allRecords.forEach(rec => {
      if (rec.status === '결재종결' && (rec.type === '연차' || rec.type?.includes('반차'))) {
        const dept = rec.department?.trim() || '미정';
        if (stats[dept]) {
          const days = rec.useDays ?? 1;
          stats[dept].used += days;
        }
      }
    });

    // Calculate rates and deviations
    Object.keys(stats).forEach(dept => {
      const s = stats[dept];
      s.rate = s.allocated > 0 ? (s.used / s.allocated) * 100 : 0;
      s.deviation = s.rate - targetRate;
    });

    return Object.entries(stats).sort((a, b) => b[1].rate - a[1].rate);
  }, [deptEmployeeMap, allRecords, targetRate]);

  return (
    <div id="main-overview-tab" className="space-y-6">
      
      {/* Unit 1: 근태구분 비율 Donut Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">지정 조건내 근태 구분별 점유 비율</h3>
            <p className="text-xs text-slate-400">선택된 부서 및 조회 기간 내 근태 항목 비율 (모든 상태 포함)</p>
          </div>
          <HelpCircle className="w-4.5 h-4.5 text-slate-300 cursor-help" title="근태구분 수동 계산 기준 전사 점유 비율 시각화 도넛" />
        </div>

        {totalTypeSum === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-xs">
            데이터가 존재하지 않습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-4">
            
            <div className="md:col-span-4 flex justify-center relative">
              <svg width="170" height="170" viewBox="0 0 150 150" className="transform -rotate-90">
                <circle 
                  cx="75" 
                  cy="75" 
                  r={radius} 
                  fill="transparent" 
                  stroke="#f1f5f9" 
                  strokeWidth="15" 
                />
                
                {chartSegments.map((segment, idx) => {
                  const colorObj = palette[idx % palette.length];
                  const strokeDashOffset = circumference - (segment.percentage / 100) * circumference;
                  const strokeDashArray = `${circumference} ${circumference}`;
                  
                  const rotation = (accumulatedPercent / 100) * 360;
                  accumulatedPercent += segment.percentage;

                  const isHovered = hoveredDonutSegment === segment.name;

                  return (
                     <circle
                      key={segment.name}
                      cx="75"
                      cy="75"
                      r={radius}
                      fill="transparent"
                      stroke={colorObj.fill}
                      strokeWidth={isHovered ? "19" : "15"}
                      strokeDasharray={strokeDashArray}
                      strokeDashoffset={strokeDashOffset}
                      transform={`rotate(${rotation} 75 75)`}
                      strokeLinecap="butt"
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredDonutSegment(segment.name)}
                      onMouseLeave={() => setHoveredDonutSegment(null)}
                    />
                  );
                })}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-450 font-bold uppercase font-mono tracking-wider">Total</span>
                <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight font-display">{totalTypeSum}</span>
                <span className="text-[10px] text-slate-400 font-medium">건</span>
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {chartSegments.map((segment, idx) => {
                const colorObj = palette[idx % palette.length];
                const isHovered = hoveredDonutSegment === segment.name;

                return (
                  <div 
                    key={segment.name}
                    onMouseEnter={() => setHoveredDonutSegment(segment.name)}
                    onMouseLeave={() => setHoveredDonutSegment(null)}
                    className={`flex items-center justify-between p-3 rounded-lg border border-slate-100 transition-colors duration-150 cursor-pointer ${
                      isHovered ? 'bg-slate-50 border-slate-200' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3.5 h-3.5 rounded-full shrink-0" 
                        style={{ backgroundColor: colorObj.fill }}
                      />
                      <span className={`text-xs font-semibold text-slate-700 ${isHovered ? 'text-slate-900 font-bold' : ''}`}>
                        {segment.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 text-right">
                      <span className="text-[11px] font-mono font-medium text-slate-450">{segment.count}건</span>
                      <span className={`text-xs font-bold font-mono ${colorObj.text}`}>
                        {segment.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}
        
        <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 flex items-center gap-1.5 font-sans mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>도넛 차트 세그먼트 혹은 리스트에 마우스를 올리면 세부 점유 수치가 확대 강조됩니다.</span>
        </div>
      </div>

      {/* Two Column Grid for Leave Usage & Leave Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Widget 2: 부서별 연차 사용률 */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display flex items-center gap-1.5">
                  <TrendingUp className="w-4.5 h-4.5 text-blue-500" />
                  부서별 연차 사용률
                </h3>
                <p className="text-xs text-slate-400">부서별 인원수 대비 총 연차 소진 비율 (부여 15일 기준)</p>
              </div>
            </div>

            {deptLeaveStats.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-xs text-slate-400">데이터가 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {deptLeaveStats.map(([dept, s]) => (
                  <div key={dept} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">{dept}</span>
                      <div className="flex items-center gap-2 text-[10.5px] font-mono text-slate-500">
                        <span>소진 <strong>{s.used}일</strong></span>
                        <span>/</span>
                        <span>총 {s.allocated}일 ({s.employeeCount}명)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-650 bg-blue-600 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(s.rate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold font-mono text-blue-600 w-11 text-right shrink-0">
                        {s.rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-[10px] text-slate-400 border-t border-slate-50 pt-3 mt-4">
            ※ 연차 사용률 = (부서 소진 연차 일수 / (부서 고유 인원 수 × 15일)) × 100
          </div>
        </div>

        {/* Widget 3: 부서별 연차 소진 경보 및 사용 촉진 관리 */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-50">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display flex items-center gap-1.5">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-500" />
                  연차 소진 경보 및 사용 촉진 관리
                </h3>
                <p className="text-xs text-slate-400">현재 월 권장 목표 대비 소진 편차 분석 및 경보 상태</p>
              </div>
            </div>

            {/* Target Rate Banner */}
            <div className="mb-4 p-3 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {activeMonth}월 권장 목표 소진율
                </span>
                <span className="text-xs text-slate-400">연간 고른 소진을 위한 목표치</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-slate-900">{targetRate.toFixed(1)}%</span>
              </div>
            </div>

            {deptLeaveStats.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-xs text-slate-400">데이터가 없습니다.</div>
            ) : (
              <div className="space-y-3.5">
                {deptLeaveStats.map(([dept, s]) => {
                  let alertLevel = '정상';
                  let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                  let icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
                  
                  if (s.rate < targetRate * 0.4) {
                    alertLevel = '사용 촉진 시급';
                    badgeClass = 'bg-rose-50 text-rose-700 border-rose-100';
                    icon = <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
                  } else if (s.rate < targetRate) {
                    alertLevel = '연차 권장 필요';
                    badgeClass = 'bg-amber-50 text-amber-700 border-amber-100';
                    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
                  }

                  const devSign = s.deviation >= 0 ? '+' : '';
                  const devClass = s.deviation >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold';

                  return (
                    <div key={dept} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        {icon}
                        <span className="font-bold text-slate-700">{dept}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-400">
                          편차: <span className={devClass}>{devSign}{s.deviation.toFixed(1)}%</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeClass}`}>
                          {alertLevel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-50 pt-3 mt-4 flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-blue-500" />
            <span>경보 등급에 따라 부서별 연차 권장 정책 수립에 참조하십시오.</span>
          </div>
        </div>

      </div>

      {/* Unit 4: 최근 근태 신청 내역 */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">최근 근태 신청 내역</h3>
          <span className="text-[10px] font-mono text-slate-400">최근 10건</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                <th className="px-5 py-3">성명</th>
                <th className="px-5 py-3">부서</th>
                <th className="px-5 py-3">구분</th>
                <th className="px-5 py-3">기간</th>
                <th className="px-5 py-3 text-center">일수</th>
                <th className="px-5 py-3 text-right">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...records]
                .sort((a, b) => (b.applyDate || '').localeCompare(a.applyDate || ''))
                .slice(0, 10)
                .map((rec, idx) => (
                  <tr key={`${rec.docId}-${idx}`} className="text-xs hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3 font-bold text-slate-900">{rec.name}</td>
                    <td className="px-5 py-3 text-slate-600">{rec.department}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.type?.includes('연차') || rec.type?.includes('반차') 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {rec.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-500 text-[11px]">{rec.period}</td>
                    <td className="px-5 py-3 text-center font-bold font-mono">{rec.useDays ?? '-'}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        rec.status === '결재종결' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
