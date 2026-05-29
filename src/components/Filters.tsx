/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Search, Filter, Briefcase, Clock, Users } from 'lucide-react';
import { TimeFilterType } from '../types';
import { getWeekRanges } from '../utils/dateUtils';

interface FiltersProps {
  timeFilter: TimeFilterType;
  setTimeFilter: (val: TimeFilterType) => void;
  
  selectedMonth: string; // 'all' | '04' | '05' | etc.
  setSelectedMonth: (val: string) => void;
  
  selectedWeek: string; // 'all' | 'w1' | 'w2' | 'w3' | 'w4' | 'w5'
  setSelectedWeek: (val: string) => void;

  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  customEndDate: string;
  setCustomEndDate: (val: string) => void;

  selectedDept: string; // 'all' | '개발본부' | etc.
  setSelectedDept: (val: string) => void;

  searchQuery: string;
  setSearchQuery: (val: string) => void;
  
  availableDepts: string[];
  
  simulatedDate: string; // "2026-05-21" etc
  setSimulatedDate: (val: string) => void;
}

export const Filters: React.FC<FiltersProps> = ({
  timeFilter,
  setTimeFilter,
  selectedMonth,
  setSelectedMonth,
  selectedWeek,
  setSelectedWeek,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  selectedDept,
  setSelectedDept,
  searchQuery,
  setSearchQuery,
  availableDepts,
  simulatedDate,
  setSimulatedDate
}) => {

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // Generate month options for all 12 months of the current year to pre-populate future months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const m = String(12 - i).padStart(2, '0');
    return { value: m, label: `${currentYear}년 ${m}월` };
  });

  const activeMonth = selectedMonth !== 'all' ? parseInt(selectedMonth) : currentMonth;
  const weekRanges = getWeekRanges(currentYear, activeMonth);

  return (
    <div id="dashboard-filters" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      
      {/* Target Analysis Date pill slider & Quick Filters title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight font-display">통합 다차원 필터링 제어판</h2>
        </div>
        
        {/* Today Simulation Target Date Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-lg shrink-0">
          <span className="text-[11px] font-bold text-slate-650 px-2 flex items-center gap-1.5 select-none">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            분석 기준일자 (오늘 날짜 변경):
          </span>
          <input 
            type="date" 
            value={simulatedDate}
            onChange={(e) => setSimulatedDate(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Unit 1: 조회 기간 (Monthly / Weekly / Custom Selection) */}
        <div className="col-span-1 md:col-span-5 space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            조회 기간 필터
          </label>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setTimeFilter('all')}
                className={`py-1.5 text-[11px] font-bold rounded-md transition cursor-pointer text-center ${
                  timeFilter === 'all' 
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-black/5' 
                    : 'text-slate-550 hover:text-slate-900'
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('monthly')}
                className={`py-1.5 text-[11px] font-bold rounded-md transition cursor-pointer text-center ${
                  timeFilter === 'monthly' 
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-black/5' 
                    : 'text-slate-550 hover:text-slate-900'
                }`}
              >
                월별
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('weekly')}
                className={`py-1.5 text-[11px] font-bold rounded-md transition cursor-pointer text-center ${
                  timeFilter === 'weekly' 
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-black/5' 
                    : 'text-slate-550 hover:text-slate-900'
                }`}
              >
                주별
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('custom')}
                className={`py-1.5 text-[11px] font-bold rounded-md transition cursor-pointer text-center ${
                  timeFilter === 'custom' 
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-black/5' 
                    : 'text-slate-550 hover:text-slate-900'
                }`}
              >
                날짜 선택
              </button>
            </div>

            {/* Sub-selectors depending on the chosen type */}
            {timeFilter === 'monthly' && (
              <div className="flex gap-2 animate-fade-in">
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                  }}
                  className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
                >
                  <option value="all">월 전체 (All Months)</option>
                  {monthOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {timeFilter === 'weekly' && (
              <div className="space-y-2 animate-fade-in">
                {/* Month overlapping filter selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">대상 월:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
                  >
                    <option value="all">월 전체</option>
                    {monthOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                {/* Week button selectors */}
                <div className="grid grid-cols-1 gap-1">
                  <button
                    key="all"
                    type="button"
                    onClick={() => setSelectedWeek('all')}
                    className={`py-1.5 px-3 text-[10px] font-bold border rounded-md transition-all cursor-pointer text-left ${
                      selectedWeek === 'all'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 hover:border-slate-350 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    전체 주차
                  </button>
                  {weekRanges.map((w) => (
                    <button
                      key={w.key}
                      type="button"
                      onClick={() => setSelectedWeek(w.key)}
                      className={`py-1.5 px-3 text-[10px] font-bold border rounded-md transition-all cursor-pointer text-left ${
                        selectedWeek === w.key
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 hover:border-slate-350 text-slate-600 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {timeFilter === 'custom' && (
              <div className="flex items-center gap-1.5 animate-fade-in">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
                <span className="text-xs text-slate-400 font-bold">~</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
            )}
            
            {timeFilter === 'all' && (
              <div className="text-[11px] text-slate-400 leading-normal px-1">
                ※ 누적된 전체 근태 데이터 내역을 기준으로 노출됩니다.
              </div>
            )}
          </div>
        </div>

        {/* Unit 2: 부서 필터 Dropdown */}
        <div className="col-span-1 md:col-span-3 space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            부서 필터
          </label>
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-lg pl-3 pr-9 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition appearance-none cursor-pointer"
            >
              <option value="all">부서 전체 (All Departments)</option>
              {availableDepts.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 border-l border-slate-105 my-2.5 pl-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Unit 3: Dynamic Real-time 검색창 */}
        <div className="col-span-1 md:col-span-4 space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            통합 실시간 키워드 검색
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="search-input-field"
                type="text"
                placeholder="직원 이름, 직급, 비고, 목적지 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium border border-slate-200 bg-white rounded-lg pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono h-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const inp = document.getElementById('search-input-field');
                if (inp) {
                  (inp as HTMLInputElement).focus();
                }
              }}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 focus:outline-none rounded-lg shadow-sm transition shrink-0 h-10 cursor-pointer"
              title="검색 진행"
            >
              <Search className="w-3.5 h-3.5" />
              <span>검색</span>
            </button>
          </div>
        </div>

      </div>

      {/* Dynamic current active indicators */}
      <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[11px] text-slate-500 border-t border-slate-100">
        <span className="font-semibold text-slate-700">활성 필터 상태 요약:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-250/60 text-slate-700 font-medium">
            조회 형태: {
              timeFilter === 'all' 
                ? '누적 전체' 
                : timeFilter === 'monthly' 
                  ? `월별 (${selectedMonth === 'all' ? '전체' : selectedMonth + '월'})` 
                  : timeFilter === 'weekly'
                    ? `주별 (${selectedMonth === 'all' ? '전체 월' : selectedMonth + '월'} ${selectedWeek === 'all' ? '전체 주' : selectedWeek + '주차'})`
                    : `직접 입력 (${customStartDate || '시작일 미지정'} ~ ${customEndDate || '종료일 미지정'})`
            }
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-250/60 text-slate-700 font-medium">
            부서: {selectedDept === 'all' ? '전체' : selectedDept}
          </span>
          {searchQuery && (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/50 text-amber-800 font-mono font-bold">
              키워드: "{searchQuery}"
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
