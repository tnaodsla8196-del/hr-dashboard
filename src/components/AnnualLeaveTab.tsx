/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, User, Heart, BarChart3, TrendingUp, Info } from 'lucide-react';
import { AttendanceRecord, TimeFilterType } from '../types';
import { InquiryPeriodSelector } from './InquiryPeriodSelector';

interface AnnualLeaveTabProps {
  records: AttendanceRecord[];
  inquiryPeriod: string;
  timeFilter: TimeFilterType;
  setTimeFilter: (val: TimeFilterType) => void;
  selectedMonth: string;
  setSelectedMonth: (val: string) => void;
  selectedWeek: string;
  setSelectedWeek: (val: string) => void;
  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  customEndDate: string;
  setCustomEndDate: (val: string) => void;
}

export const AnnualLeaveTab: React.FC<AnnualLeaveTabProps> = ({
  records,
  inquiryPeriod,
  timeFilter,
  setTimeFilter,
  selectedMonth,
  setSelectedMonth,
  selectedWeek,
  setSelectedWeek,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate
}) => {
  // Filtering condition: Only keep 연차, 오후반차, 오전반차 as requested
  const filteredLeaveRecords = records.filter(rec => {
    const t = rec.type?.trim();
    return t === '연차' || t === '오후반차' || t === '오전반차';
  });

  // Sort by date descending (latest first)
  const sortedLeaveRecords = React.useMemo(() => {
    return [...filteredLeaveRecords].sort((a, b) => {
      const dateA = a.startDate || a.applyDate || '';
      const dateB = b.startDate || b.applyDate || '';
      return dateB.localeCompare(dateA);
    });
  }, [filteredLeaveRecords]);

  // Calculate aggregation stats
  const totalDays = filteredLeaveRecords.reduce((sum, rec) => sum + (rec.useDays || 0), 0);
  const avgDays = filteredLeaveRecords.length > 0 ? (totalDays / filteredLeaveRecords.length) : 0;
  
  // Find top department
  const deptUsage: { [key: string]: number } = {};
  filteredLeaveRecords.forEach(r => {
    deptUsage[r.department] = (deptUsage[r.department] || 0) + (r.useDays || 0);
  });
  const sortedDepts = Object.entries(deptUsage).sort((a, b) => b[1] - a[1]);
  const topDeptName = sortedDepts[0]?.[0] || '없음';
  const topDeptDays = sortedDepts[0]?.[1] || 0;

  return (
    <div id="annual-leave-tab" className="space-y-6">
      
      {/* Leave Aggregate Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Days Used */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs hover:shadow-sm transition-all duration-300 space-y-2 group">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>선택 범위 내 총 연차 소진 일수</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-105">
              <Heart className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-3xl font-bold font-mono text-slate-900 font-display group-hover:text-blue-600 transition-colors">{totalDays}</span>
            <span className="text-xs font-bold text-slate-500">일</span>
          </div>
          <p className="text-[11px] text-slate-400">
            오전/오후 반차 반영된 정확한 연차 차감 일수 (반차 = 0.5일)
          </p>
        </div>

        {/* Card 2: Avg Days of Leave */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs hover:shadow-sm transition-all duration-300 space-y-2 group">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>신청 1건당 평균 신청 일수</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 ring-1 ring-indigo-105">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-3xl font-bold font-mono text-slate-900 font-display group-hover:text-indigo-600 transition-colors">{avgDays.toFixed(1)}</span>
            <span className="text-xs font-bold text-slate-500">일</span>
          </div>
          <p className="text-[11px] text-slate-400">
            임직원의 한 번당 연차 연속 휴무 상태 일수 평균치
          </p>
        </div>

        {/* Card 3: Top Leave Department */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs hover:shadow-sm transition-all duration-300 space-y-2 group">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>최다 연차 사용 부서</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-xl font-bold text-slate-950 font-display truncate max-w-[150px]">{topDeptName}</span>
            <span className="text-xs font-mono font-bold text-slate-500">({topDeptDays}일)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            조회 범위 내 최다 연차를 소진한 전사 조직 부서
          </p>
        </div>
      </div>

      {/* Main Table for Leaves */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">법정휴가 사용대장</h3>
              <InquiryPeriodSelector
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedWeek={selectedWeek}
                setSelectedWeek={setSelectedWeek}
                customStartDate={customStartDate}
                setCustomStartDate={setCustomStartDate}
                customEndDate={customEndDate}
                setCustomEndDate={setCustomEndDate}
                inquiryPeriodText={inquiryPeriod}
                themeColor="blue"
              />
            </div>
            <p className="text-xs text-slate-500 font-sans">
              연차, 오전/오후반차 등의 법정 및 복지 휴가 데이터 목록입니다.
            </p>
          </div>
          <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono ring-1 ring-slate-200/40">
            총 휴가 검색건수: {sortedLeaveRecords.length}건
          </div>
        </div>

        {sortedLeaveRecords.length === 0 ? (
          <div id="leave-table-empty" className="p-16 text-center text-slate-450 space-y-4">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-850">해당 조건에 부합하는 휴가 사용 내역이 없습니다.</p>
              <p className="text-[11px] text-slate-400">상단의 통합 다차원 필터나 조회 부서 또는 분석 일자를 변경해 보십시오.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                  <th className="px-6 py-3.5">부서</th>
                  <th className="px-6 py-3.5">직급</th>
                  <th className="px-6 py-3.5">이름</th>
                  <th className="px-6 py-3.5">기간 범위</th>
                  <th className="px-6 py-3.5">사용일수</th>
                  <th className="px-6 py-3.5">상태</th>
                  <th className="px-6 py-3.5">비고 / 신청내역</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedLeaveRecords.map((rec) => (
                  <tr 
                    key={rec.docId} 
                    className="text-xs hover:bg-slate-50/50 transition duration-150"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {rec.department}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {rec.position}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{rec.name}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-650">
                      <div className="flex items-center gap-1.5 font-mono">
                        {rec.period}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 border border-slate-200/85 rounded shadow-2xs">
                        {rec.useDays !== undefined ? `${rec.useDays}일` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.status === '결재종결' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : rec.status === '결재중' 
                            ? 'bg-blue-100 text-blue-800 animate-pulse' 
                            : 'bg-slate-100 text-slate-650'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate font-medium" title={rec.remarks || rec.typeDetail}>
                      {rec.remarks || rec.typeDetail || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-800 font-display">연차 소진일수 산정 기준 안내</h4>
          <p className="text-[11.5px] text-slate-500 leading-normal font-sans">
            표준 연차 및 보건 휴무는 1일 단위 소모를 원칙으로 하며, 오전 반차 및 오후 반차 신청의 경우 0.5일 차감 처리됩니다. 수동 등록된 신규 내역 역시 법인 규격 및 근로기준법상 산정 기준이 자동 반영되어 요약 카드에 누적됩니다.
          </p>
        </div>
      </div>

    </div>
  );
};
