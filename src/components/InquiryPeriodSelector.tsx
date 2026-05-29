/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check, Clock } from 'lucide-react';
import { TimeFilterType } from '../types';
import { getWeekRanges } from '../utils/dateUtils';

interface InquiryPeriodSelectorProps {
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
  inquiryPeriodText: string;
  themeColor?: 'blue' | 'indigo' | 'slate';
}

export const InquiryPeriodSelector: React.FC<InquiryPeriodSelectorProps> = ({
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
  inquiryPeriodText,
  themeColor = 'blue'
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Generate month options for all 12 months of the current year to pre-populate future months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const m = String(12 - i).padStart(2, '0');
    return { value: m, label: `${currentYear}년 ${m}월` };
  });

  const activeMonth = selectedMonth !== 'all' ? parseInt(selectedMonth) : currentMonth;
  const weekRanges = getWeekRanges(currentYear, activeMonth);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const badgeColorClass = {
    blue: 'text-blue-705 bg-blue-50/70 hover:bg-blue-100 border-blue-200/60',
    indigo: 'text-indigo-755 bg-indigo-50/70 hover:bg-indigo-100 border-indigo-200/60',
    slate: 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-300'
  }[themeColor];

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Badge Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold border rounded font-sans transition-all duration-200 cursor-pointer shadow-2xs ${badgeColorClass}`}
        title="조회기간 변경을 위해 클릭"
      >
        <Calendar className="w-3 h-3 shrink-0" />
        <span>조회기간: {inquiryPeriodText}</span>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Popover Card */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 space-y-3 animate-fade-in text-left">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1 select-none">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              조회 기간 직접 선택
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
            >
              닫기
            </button>
          </div>

          {/* Quick Select Filter Types */}
          <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 rounded-lg">
            {(['all', 'monthly', 'weekly', 'custom'] as const).map((filter) => {
              const label = {
                all: '전체',
                monthly: '월별',
                weekly: '주별',
                custom: '날짜 선택'
              }[filter];
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTimeFilter(filter)}
                  className={`py-1 text-[9.5px] font-bold rounded transition text-center cursor-pointer ${
                    timeFilter === filter 
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Dynamic Content based on Time Filter */}
          <div className="pt-1">
            {timeFilter === 'all' && (
              <div className="text-[11px] text-slate-500 leading-normal text-center py-2 bg-slate-50 rounded border border-slate-150">
                전체 근태 데이터를 조회합니다.
              </div>
            )}

            {timeFilter === 'monthly' && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">대상 월 선택</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">월 전체</option>
                  {monthOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {timeFilter === 'weekly' && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">대상 월</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">월 전체</option>
                    {monthOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">주차 선택</label>
                  <div className="grid grid-cols-1 gap-1">
                    <button
                      key="all"
                      type="button"
                      onClick={() => setSelectedWeek('all')}
                      className={`py-1.5 px-3 text-[10px] font-bold border rounded-md transition-all cursor-pointer text-left ${
                        selectedWeek === 'all'
                          ? 'border-blue-600 bg-blue-600 text-white shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-650 bg-white hover:bg-slate-50'
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
                            ? 'border-blue-600 bg-blue-600 text-white shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 text-slate-650 bg-white hover:bg-slate-50'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {timeFilter === 'custom' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">시작일</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full text-xs border border-slate-200 bg-white rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">종료일</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full text-xs border border-slate-200 bg-white rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>적용 및 필터 닫기</span>
          </button>
        </div>
      )}
    </div>
  );
};
