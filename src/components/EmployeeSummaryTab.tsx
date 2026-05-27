/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { Users, User, ChevronDown, ChevronRight, FileText, Calendar, Award, Plane, Briefcase, HelpCircle } from 'lucide-react';
import { AttendanceRecord, CommuteRecord, TimeFilterType } from '../types';
import { InquiryPeriodSelector } from './InquiryPeriodSelector';

interface EmployeeSummaryTabProps {
  records: AttendanceRecord[];         // All raw or filtered records depending on how we calculate
  rawRecords: AttendanceRecord[];      // Pass unfiltered records if needed to calculate global stats
  commuteRecords?: CommuteRecord[];
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

interface EmployeeSummary {
  sapId: string;
  name: string;
  department: string;
  position: string;
  annualLeaveDays: number;
  businessTripCount: number;
  compensationLeaveCount: number;
  officialLeaveCount: number;
  history: AttendanceRecord[];
}

export const EmployeeSummaryTab: React.FC<EmployeeSummaryTabProps> = ({
  records,
  rawRecords,
  commuteRecords = [],
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
  // Track expanded rows and active drill-down category by employee SAP ID
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean | string>>({});

  const toggleExpand = (sapId: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [sapId]: prev[sapId] ? false : 'annual'
    }));
  };

  // Helper classification logic
  const getMappedType = (typeVal: string) => {
    const t = typeVal?.trim();
    if (t === '연차' || t === '오후반차' || t === '오전반차') {
      return '연차';
    }
    if (t === '휴가(대체,보상)' || t === '휴가(대체,보상)_반차' || t === '보상휴가') {
      return '보상휴가';
    }
    if (t === '경조휴가' || t === '공가(병무,건강검진)' || t === '난임휴가(유급)' || t === '공가') {
      return '공가';
    }
    return '국내출장';
  };

  // 1. Gather all unique employees present in the raw data
  const uniqueEmployees = useMemo(() => {
    const map = new Map<string, { sapId: string; name: string; department: string; position: string }>();
    
    // Scan all attendance records
    rawRecords.forEach(r => {
      if (r.sapId) {
        const id = r.sapId.trim();
        if (!map.has(id)) {
          map.set(id, {
            sapId: id,
            name: r.name?.trim() || '미기재',
            department: r.department?.trim() || '부서 미정',
            position: r.position?.trim() || '직급 미정'
          });
        }
      }
    });

    // Scan all commute records
    commuteRecords.forEach(c => {
      if (c.sapId) {
        const id = c.sapId.trim();
        if (!map.has(id)) {
          map.set(id, {
            sapId: id,
            name: c.name?.trim() || '미기재',
            department: c.department?.trim() || '부서 미정',
            position: c.position?.trim() || '직급 미정'
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [rawRecords, commuteRecords]);

  // 2. Compute aggregated attendance statistics for each employee *within the current filtered context*
  const employeeSummaries = useMemo(() => {
    return uniqueEmployees.map(emp => {
      // Find filtered records belonging to this employee
      const empRecords = records.filter(r => r.sapId?.trim() === emp.sapId);

      let annualLeaveDays = 0;
      let businessTripCount = 0;
      let compensationLeaveCount = 0;
      let officialLeaveCount = 0;

      empRecords.forEach(rec => {
        const type = getMappedType(rec.type);
        if (type === '연차') {
          annualLeaveDays += rec.useDays || 0;
        } else if (type === '보상휴가') {
          compensationLeaveCount++;
        } else if (type === '공가') {
          officialLeaveCount++;
        } else if (type === '국내출장') {
          businessTripCount++;
        }
      });

      // Sort history descending by date
      const sortedHistory = [...empRecords].sort((a, b) => {
        const dateA = a.startDate || a.applyDate || '';
        const dateB = b.startDate || b.applyDate || '';
        return dateB.localeCompare(dateA);
      });

      return {
        ...emp,
        annualLeaveDays,
        businessTripCount,
        compensationLeaveCount,
        officialLeaveCount,
        history: sortedHistory
      };
    });
  }, [uniqueEmployees, records]);

  // 3. Filter employees that have at least one record in the current filtered set OR match active search/dept filters
  const filteredSummaries = useMemo(() => {
    // We only display employees who are part of the active filtered summaries AND have actual activity, 
    // OR if we want to show all employees who match department & search parameters.
    // Let's filter employees by search query and department if they are matching.
    // Note: 'records' is already filtered globally by department and search.
    // So if records is empty for someone, they might have 0 counts.
    // To make it dynamic, let's keep only employees who have at least one count > 0,
    // OR if there is an active search query, show that person even with 0 counts.
    return employeeSummaries.filter(emp => {
      // Check if they have records in the filtered records list
      const hasRecords = emp.history.length > 0;
      
      // If we are searching for a specific name/id, show them
      if (hasRecords) return true;
      
      return false; // Only show people with active usage in this filtered view
    });
  }, [employeeSummaries]);

  // Overall sums in current filtered set
  const totalEmployeesWithActivity = filteredSummaries.length;
  const totalLeaveDays = filteredSummaries.reduce((sum, e) => sum + e.annualLeaveDays, 0);
  const totalTrips = filteredSummaries.reduce((sum, e) => sum + e.businessTripCount, 0);
  const totalComps = filteredSummaries.reduce((sum, e) => sum + e.compensationLeaveCount, 0);

  return (
    <div id="employee-summary-tab" className="space-y-6 animate-fade-in">
      
      {/* Metrics Header Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs text-center flex flex-col justify-center items-center">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">조회 대상 인원</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-slate-900 font-display">{totalEmployeesWithActivity}</span>
            <span className="text-sm text-slate-500 font-bold">명</span>
          </div>
        </div>
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs text-center flex flex-col justify-center items-center">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">총 연차 소진</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-blue-600 font-display">{totalLeaveDays}</span>
            <span className="text-sm text-blue-500 font-bold">일</span>
          </div>
        </div>
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs text-center flex flex-col justify-center items-center">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">총 출장 건수</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-indigo-600 font-display">{totalTrips}</span>
            <span className="text-sm text-indigo-500 font-bold">건</span>
          </div>
        </div>
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs text-center flex flex-col justify-center items-center">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">총 보상휴가 건수</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-emerald-600 font-display">{totalComps}</span>
            <span className="text-sm text-emerald-500 font-bold">건</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">임직원별 통합 근태 현황</h3>
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
                themeColor="slate"
              />
            </div>
            <p className="text-xs text-slate-500 font-sans">
              선택한 조회 기간 동안 각 임직원별 연차 사용일수 및 출장, 보상휴가, 공가 신청 건수를 한눈에 확인합니다.
            </p>
          </div>
          <HelpCircle className="w-4.5 h-4.5 text-slate-400 cursor-help hidden md:block" title="이름 왼편의 화살표를 누르시면 해당 조회기간 내 상세 신청 이력을 확인할 수 있습니다." />
        </div>

        {filteredSummaries.length === 0 ? (
          <div className="p-16 text-center text-slate-450 space-y-4">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-850">선택 조건에 해당하는 임직원 근태 통계 데이터가 없습니다.</p>
              <p className="text-[11px] text-slate-400">필터 조건(조회 기간, 검색 키워드, 부서)을 넓게 조정해 보십시오.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-50/70 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider select-none">
                  <th className="px-6 py-3.5 w-12"></th>
                  <th className="px-6 py-3.5">사번</th>
                  <th className="px-6 py-3.5">성명</th>
                  <th className="px-6 py-3.5">부서</th>
                  <th className="px-6 py-3.5">직급</th>
                  <th className="px-6 py-3.5 text-center">연차 사용일수</th>
                  <th className="px-6 py-3.5 text-center">출장 건수</th>
                  <th className="px-6 py-3.5 text-center">보상휴가 건수</th>
                  <th className="px-6 py-3.5 text-center">공가 건수</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSummaries.map((emp) => {
                  const isExpanded = !!expandedIds[emp.sapId];
                  return (
                    <React.Fragment key={emp.sapId}>
                      <tr 
                        className={`text-xs hover:bg-slate-50/50 transition duration-150 cursor-pointer ${
                          isExpanded ? 'bg-slate-50/30' : ''
                        }`}
                        onClick={() => toggleExpand(emp.sapId)}
                      >
                        {/* Toggle Icon */}
                        <td className="px-6 py-4.5 text-center">
                          <button
                            type="button"
                            className="p-1 hover:bg-slate-100 rounded text-slate-450 hover:text-slate-800 transition"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>

                        {/* SAP ID */}
                        <td className="px-6 py-4.5 font-bold font-mono text-blue-600">
                          {emp.sapId}
                        </td>

                        {/* Name */}
                        <td className="px-6 py-4.5">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {emp.name}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="px-6 py-4.5 font-semibold text-slate-700">
                          {emp.department}
                        </td>

                        {/* Position */}
                        <td className="px-6 py-4.5 text-slate-500 font-medium">
                          {emp.position}
                        </td>

                        {/* Annual Leave Days */}
                        <td className="px-6 py-4.5 text-center">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                            emp.annualLeaveDays > 0 
                              ? 'bg-blue-50 text-blue-800 border-blue-200/50' 
                              : 'bg-slate-50 text-slate-400 border-slate-200/40'
                          }`}>
                            {emp.annualLeaveDays > 0 ? `${emp.annualLeaveDays}일` : '0일'}
                          </span>
                        </td>

                        {/* Trips Count */}
                        <td className="px-6 py-4.5 text-center">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                            emp.businessTripCount > 0 
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200/50' 
                              : 'bg-slate-50 text-slate-400 border-slate-200/40'
                          }`}>
                            {emp.businessTripCount > 0 ? `${emp.businessTripCount}건` : '0건'}
                          </span>
                        </td>

                        {/* Compensation Leaves Count */}
                        <td className="px-6 py-4.5 text-center">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                            emp.compensationLeaveCount > 0 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/50' 
                              : 'bg-slate-50 text-slate-400 border-slate-200/40'
                          }`}>
                            {emp.compensationLeaveCount > 0 ? `${emp.compensationLeaveCount}건` : '0건'}
                          </span>
                        </td>

                        {/* Official Leaves Count */}
                        <td className="px-6 py-4.5 text-center">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                            emp.officialLeaveCount > 0 
                              ? 'bg-teal-50 text-teal-850 border-teal-200/50' 
                              : 'bg-slate-50 text-slate-400 border-slate-200/40'
                          }`}>
                            {emp.officialLeaveCount > 0 ? `${emp.officialLeaveCount}건` : '0건'}
                          </span>
                        </td>
                      </tr>

                      {/* Enhanced Drill-down Detail Panel */}
                      {isExpanded && (() => {
                        // Category tabs for drill-down
                        const categories = [
                          { key: 'annual', label: `연차사용일수 (${emp.annualLeaveDays}일)`, color: 'blue' },
                          { key: 'trip', label: `출장건수 (${emp.businessTripCount}건)`, color: 'indigo' },
                          { key: 'comp', label: `보상휴가 (${emp.compensationLeaveCount}건)`, color: 'emerald' },
                          { key: 'official', label: `공가/경조 (${emp.officialLeaveCount}건)`, color: 'teal' },
                        ];

                        // Determine active drilldown tab
                        const activeCat = expandedIds[emp.sapId] === true ? 'annual' : (expandedIds[emp.sapId] as unknown as string || 'annual');

                        // Filter history by active category
                        const getCategoryRecords = (cat: string) => {
                          return emp.history.filter(h => {
                            const mapped = getMappedType(h.type);
                            if (cat === 'annual') return mapped === '연차';
                            if (cat === 'trip') return mapped === '국내출장';
                            if (cat === 'comp') return mapped === '보상휴가';
                            if (cat === 'official') return mapped === '공가';
                            return true;
                          });
                        };

                        const activeRecords = activeCat === 'annual' ? getCategoryRecords('annual')
                          : activeCat === 'trip' ? getCategoryRecords('trip')
                          : activeCat === 'comp' ? getCategoryRecords('comp')
                          : getCategoryRecords('official');

                        // Compute sub-type breakdown for annual leave
                        const annualBreakdown = (() => {
                          const annualRecs = getCategoryRecords('annual');
                          let fullDays = 0, fullCount = 0;
                          let amHalfDays = 0, amHalfCount = 0;
                          let pmHalfDays = 0, pmHalfCount = 0;
                          annualRecs.forEach(r => {
                            const t = r.type?.trim();
                            if (t === '오전반차') { amHalfCount++; amHalfDays += r.useDays || 0.5; }
                            else if (t === '오후반차') { pmHalfCount++; pmHalfDays += r.useDays || 0.5; }
                            else { fullCount++; fullDays += r.useDays || 1; }
                          });
                          return { fullCount, fullDays, amHalfCount, amHalfDays, pmHalfCount, pmHalfDays };
                        })();

                        return (
                        <tr>
                          <td colSpan={9} className="bg-slate-50/40 px-4 sm:px-8 py-5 border-t border-b border-slate-150">
                            <div className="space-y-4">
                              {/* Title bar */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg">
                                  <FileText className="w-3.5 h-3.5" />
                                  <span className="text-[11px] font-bold">
                                    [사번 {emp.sapId}] {emp.name} {emp.position}님 근태 심층 분류 데이터 교차 분석
                                  </span>
                                </div>
                              </div>

                              {/* Category Tab Buttons */}
                              <div className="flex flex-wrap gap-1.5">
                                {categories.map(cat => {
                                  const isActive = activeCat === cat.key;
                                  const colorMap: Record<string, string> = {
                                    blue: isActive ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-blue-700 ring-blue-200 hover:bg-blue-50',
                                    indigo: isActive ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-white text-indigo-700 ring-indigo-200 hover:bg-indigo-50',
                                    emerald: isActive ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-emerald-700 ring-emerald-200 hover:bg-emerald-50',
                                    teal: isActive ? 'bg-teal-600 text-white ring-teal-600' : 'bg-white text-teal-700 ring-teal-200 hover:bg-teal-50',
                                  };
                                  return (
                                    <button
                                      key={cat.key}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedIds(prev => ({ ...prev, [emp.sapId]: cat.key as any }));
                                      }}
                                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg ring-1 transition-all cursor-pointer ${colorMap[cat.color]}`}
                                    >
                                      {cat.label}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Sub-type Breakdown Cards (for annual leave) */}
                              {activeCat === 'annual' && (
                                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                                  <h4 className="text-xs font-bold text-slate-700">세부 유형별 상세 점검</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="p-3 border border-slate-100 rounded-lg">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] text-slate-500 font-semibold">연차</span>
                                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">FULL</span>
                                      </div>
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold font-mono text-slate-900">{annualBreakdown.fullCount}건</span>
                                        <span className="text-xs text-slate-400">({annualBreakdown.fullDays}일)</span>
                                      </div>
                                    </div>
                                    <div className="p-3 border border-slate-100 rounded-lg">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] text-slate-500 font-semibold">오전반차</span>
                                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">AM HALF</span>
                                      </div>
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold font-mono text-slate-900">{annualBreakdown.amHalfCount}건</span>
                                        <span className="text-xs text-slate-400">({annualBreakdown.amHalfDays}일)</span>
                                      </div>
                                    </div>
                                    <div className="p-3 border border-slate-100 rounded-lg">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] text-slate-500 font-semibold">오후반차</span>
                                        <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">PM HALF</span>
                                      </div>
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold font-mono text-slate-900">{annualBreakdown.pmHalfCount}건</span>
                                        <span className="text-xs text-slate-400">({annualBreakdown.pmHalfDays}일)</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Detailed History Table */}
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-700">개별 신청서 세부 이력 대장</span>
                                  <span className="text-[10px] font-mono text-slate-400">{activeRecords.length}건</span>
                                </div>
                                {activeRecords.length === 0 ? (
                                  <p className="text-[11px] text-slate-400 p-6 text-center">해당 카테고리의 신청 내역이 없습니다.</p>
                                ) : (
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-slate-50/70 text-[10px] font-bold text-slate-500 border-b border-slate-200">
                                        <th className="px-4 py-2">문서번호</th>
                                        <th className="px-4 py-2">기안일</th>
                                        <th className="px-4 py-2">구분</th>
                                        <th className="px-4 py-2">신청 기간</th>
                                        <th className="px-4 py-2 text-center">사용일</th>
                                        <th className="px-4 py-2">신청 목적 및 상세 사용</th>
                                        <th className="px-4 py-2 text-right">진행 상태</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-[11px]">
                                      {activeRecords.map((hist, hIdx) => {
                                        const mappedCategory = getMappedType(hist.type);
                                        let catBadge = "bg-slate-100 text-slate-650";
                                        if (mappedCategory === '연차') catBadge = "bg-blue-100 text-blue-800";
                                        if (mappedCategory === '보상휴가') catBadge = "bg-amber-100 text-amber-800";
                                        if (mappedCategory === '공가') catBadge = "bg-teal-100 text-teal-800";
                                        if (mappedCategory === '국내출장') catBadge = "bg-indigo-100 text-indigo-800";

                                        return (
                                          <tr key={`${hist.docId}-${hIdx}`} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-2.5 font-mono text-blue-600 font-semibold text-[10px]">{hist.docId || '-'}</td>
                                            <td className="px-4 py-2.5 font-mono text-slate-500">{hist.applyDate}</td>
                                            <td className="px-4 py-2.5">
                                              <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${catBadge}`}>
                                                {hist.type}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-slate-600 font-semibold">{hist.period}</td>
                                            <td className="px-4 py-2.5 text-center">
                                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-mono">{hist.useDays ?? '-'}일</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-slate-600 max-w-[280px]">
                                              <div className="font-medium truncate">{hist.typeDetail || hist.tripPurpose || '-'}</div>
                                              {hist.remarks && (
                                                <div className="text-[10px] text-slate-400 mt-0.5">비고: {hist.remarks}</div>
                                              )}
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold ${
                                                hist.status === '결재종결' 
                                                  ? 'bg-emerald-100 text-emerald-800' 
                                                  : hist.status === '결재중' 
                                                    ? 'bg-blue-100 text-blue-800 animate-pulse' 
                                                    : 'bg-slate-100 text-slate-650'
                                              }`}>
                                                {hist.status}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                        );
                      })()}
                    </React.Fragment>
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
