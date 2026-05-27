/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navigation, ShieldCheck } from 'lucide-react';
import { AttendanceRecord, TimeFilterType } from '../types';
import { InquiryPeriodSelector } from './InquiryPeriodSelector';

interface BusinessTripTabProps {
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

export const BusinessTripTab: React.FC<BusinessTripTabProps> = ({
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
  // Filtering condition: Include all records except '연차', '오후반차', '오전반차'
  const filteredTripRecords = records.filter(rec => {
    const t = rec.type?.trim();
    const isAnnualLeave = t === '연차' || t === '오후반차' || t === '오전반차';
    return !isAnnualLeave;
  });

  // Sort by date descending (latest first)
  const sortedTripRecords = React.useMemo(() => {
    return [...filteredTripRecords].sort((a, b) => {
      const dateA = a.startDate || a.applyDate || '';
      const dateB = b.startDate || b.applyDate || '';
      return dateB.localeCompare(dateA);
    });
  }, [filteredTripRecords]);

  // Mapped classification logic for BusinessTripTab
  const getMappedType = (typeVal: string) => {
    const t = typeVal?.trim();
    if (t === '휴가(대체,보상)' || t === '휴가(대체,보상)_반차' || t === '보상휴가') {
      return '보상휴가';
    }
    if (t === '경조휴가' || t === '공가(병무,건강검진)' || t === '난임휴가(유급)' || t === '공가') {
      return '공가';
    }
    return '국내출장';
  };

  // Calculating stats
  const totalCount = filteredTripRecords.length;
  const domesticTripCount = filteredTripRecords.filter(rec => getMappedType(rec.type) === '국내출장').length;
  const compensationLeavesCount = filteredTripRecords.filter(rec => getMappedType(rec.type) === '보상휴가').length;
  const officialLeavesCount = filteredTripRecords.filter(rec => getMappedType(rec.type) === '공가').length;

  return (
    <div id="business-trip-tab" className="space-y-6">

      {/* Simplified Aggregate Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs text-center flex flex-col justify-center items-center hover:border-slate-300 transition-all duration-200">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">총 대상건수</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-slate-900 font-display">{totalCount}</span>
            <span className="text-sm text-slate-500 font-bold">건</span>
          </div>
        </div>
        {/* Metric 2 */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs text-center flex flex-col justify-center items-center hover:border-slate-300 transition-all duration-200">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">국내출장</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-indigo-600 font-display">{domesticTripCount}</span>
            <span className="text-sm text-indigo-500 font-bold">건</span>
          </div>
        </div>
        {/* Metric 3 */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs text-center flex flex-col justify-center items-center hover:border-slate-300 transition-all duration-200">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">보상휴가</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-emerald-600 font-display">{compensationLeavesCount}</span>
            <span className="text-sm text-emerald-500 font-bold">건</span>
          </div>
        </div>
        {/* Metric 4 */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs text-center flex flex-col justify-center items-center hover:border-slate-300 transition-all duration-200">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">공가</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-teal-600 font-display">{officialLeavesCount}</span>
            <span className="text-sm text-teal-500 font-bold">건</span>
          </div>
        </div>
      </div>

      {/* Main Spacious Table component */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">출장 및 보상휴가 외 대장</h3>
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
                themeColor="indigo"
              />
            </div>
            <p className="text-xs text-slate-500 font-sans">
              출장 목적지, 구체적 프로젝트 업무 지침 등 고밀도 텍스트를 안전하게 검수하는 전용 대장입니다.
            </p>
          </div>
          <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono ring-1 ring-slate-200/40">
            조회 필터 검색결과: {sortedTripRecords.length}건
          </div>
        </div>

        {sortedTripRecords.length === 0 ? (
          <div id="trip-table-empty" className="p-16 text-center text-slate-450 space-y-4">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
              <Navigation className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-850">지정된 조건에 매핑되는 출장 및 보상휴가 내역이 존재하지 않습니다.</p>
              <p className="text-[11px] text-slate-400">우측 상단 제어판에서 신규 근태를 수동 등록하거나 조회 필터를 넓혀 변경해 보세요.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/70 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                  <th className="px-6 py-4.5 w-40">신청일</th>
                  <th className="px-6 py-4.5 w-40">부서</th>
                  <th className="px-6 py-4.5 w-36">이름</th>
                  <th className="px-6 py-4.5 w-40">근태구분</th>
                  <th className="px-6 py-4.5 w-64">기간 범위</th>
                  <th className="px-6 py-4.5 min-w-[320px]">출장목적 및 수행업무</th>
                  <th className="px-6 py-4.5 text-right w-28">결재상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedTripRecords.map((rec) => {
                  const mappedType = getMappedType(rec.type);
                  
                  return (
                    <tr 
                      key={rec.docId} 
                      className="text-xs hover:bg-slate-50/50 transition duration-150"
                    >
                      {/* 신청일 */}
                      <td className="px-6 py-4.5 font-mono text-slate-450 font-medium">
                        {rec.applyDate}
                      </td>

                      {/* 부서 */}
                      <td className="px-6 py-4.5 font-semibold text-slate-700">
                        {rec.department}
                      </td>

                      {/* 이름 */}
                      <td className="px-6 py-4.5 font-bold text-slate-900">
                        {rec.name}
                      </td>

                      {/* 근태구분 */}
                      <td className="px-6 py-4.5">
                        {(() => {
                          if (mappedType === '보상휴가') {
                            return (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-bold text-[10.5px] bg-amber-50 text-amber-800 ring-1 ring-amber-500/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {rec.type} (보상휴가)
                              </span>
                            );
                          } else if (mappedType === '공가') {
                            return (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-bold text-[10.5px] bg-teal-50 text-teal-850 ring-1 ring-teal-500/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                {rec.type} (공가)
                              </span>
                            );
                          } else {
                            return (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-bold text-[10.5px] bg-indigo-50 text-indigo-805 ring-1 ring-indigo-500/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                {rec.type} (국내출장)
                              </span>
                            );
                          }
                        })()}
                      </td>

                      {/* 기간 */}
                      <td className="px-6 py-4.5 font-mono text-slate-750 font-semibold">
                        {rec.period}
                      </td>



                      {/* 출장목적 */}
                      <td className="px-6 py-4.5 text-slate-650 leading-relaxed font-sans max-w-sm whitespace-normal pb-4.5 pt-4.5">
                        <div className="font-bold text-slate-805 mb-0.5 line-clamp-1" title={rec.typeDetail}>
                          {rec.typeDetail || '-'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium line-clamp-2" title={rec.tripPurpose}>
                          {rec.tripPurpose || rec.remarks || ''}
                        </div>
                      </td>

                      {/* 상태 */}
                      <td className="px-6 py-4.5 text-right font-medium">
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-755 shrink-0" />
        <span className="text-xs text-blue-850 font-sans leading-relaxed">
          <b>직무 출장 규정 준수 안내:</b> 출장지 목적이 명확히 기재되어 있어야 지출결의 경비 사후 정산(ERP 연동)이 정상처리되며, 주말/야간 연계 시 보상휴가 부여가 수동 계산 기준 및 노사협약에 의거 자동 진행됩니다.
        </span>
      </div>

    </div>
  );
};
