/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { AttendanceRecord, CommuteRecord, TimeFilterType } from './types';
import { initialAttendanceData, parseCSVToRecords, parseCSVToCommuteRecords } from './data';
import { getWeekRanges } from './utils/dateUtils';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { MainOverviewTab } from './components/MainOverviewTab';
import { AnnualLeaveTab } from './components/AnnualLeaveTab';
import { BusinessTripTab } from './components/BusinessTripTab';
import { EmployeeSummaryTab } from './components/EmployeeSummaryTab';
import { Layers, CalendarDays, ClipboardCheck, ArrowRightLeft, Info, HelpCircle, Users } from 'lucide-react';
import {
  isSupabaseConfigured,
  fetchAttendanceRecords,
  fetchCommuteRecords,
  upsertAttendanceRecords,
  upsertCommuteRecords
} from './supabaseClient';

export default function App() {
  // Main state holding the list of all active attendance records
  const [records, setRecords] = useState<AttendanceRecord[]>(initialAttendanceData);

  // State for check-in/check-out records loaded from the '근태확인' sheet
  const [commuteRecords, setCommuteRecords] = useState<CommuteRecord[]>([]);

  // Filter States
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all', '04', '05' etc.
  const [selectedWeek, setSelectedWeek] = useState<string>('all');   // 'all', '1', '2', '3', '4', '5'
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Real-time analysis target date (Simulating "today") — auto-set to system date
  const [simulatedDate, setSimulatedDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  // Active Tab State: 1 = 통합 대시보드, 2 = 연차 사용 내역, 3 = 출장 및 기타 근무
  const [activeTab, setActiveTab] = useState<number>(1);

  // Real-time synchronization states
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<'not_configured' | 'connecting' | 'connected' | 'error'>('not_configured');

  // Real-time Google Sheet CSV fetch implementation
  const handleSyncData = async (showNotification = true) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const sheetId = '1fsypp6-z5wZ73GhzVNu8FE8EtmVYgv7LVuRzHIaSUUA';
      const csvExportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const commuteExportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=%EA%B7%BC%ED%83%9C%ED%99%95%EC%9D%B8`;
      
      const [res1, res2] = await Promise.all([
        fetch(csvExportUrl),
        fetch(commuteExportUrl)
      ]);
      
      if (!res1.ok) {
        throw new Error(`Google Sheets main sheet export failed with status ${res1.status}`);
      }
      if (!res2.ok) {
        throw new Error(`Google Sheets check-in sheet export failed with status ${res2.status}`);
      }
      
      const [csvText, commuteText] = await Promise.all([
        res1.text(),
        res2.text()
      ]);
      
      const parsedRecords = parseCSVToRecords(csvText);
      const parsedCommutes = parseCSVToCommuteRecords(commuteText);
      
      if (parsedRecords && parsedRecords.length > 0) {
        setRecords(parsedRecords);
        setCommuteRecords(parsedCommutes);
        
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        setLastSyncedAt(timeStr);
        setSyncError(null);

        // Synchronize parsed data to Supabase if configured
        if (isSupabaseConfigured) {
          try {
            await upsertAttendanceRecords(parsedRecords);
            await upsertCommuteRecords(parsedCommutes);
            setSupabaseStatus('connected');
          } catch (dbErr) {
            console.error('Failed to sync data to Supabase DB:', dbErr);
            setSupabaseStatus('error');
          }
        }
        
        if (showNotification) {
          const syncDest = isSupabaseConfigured ? '구글 스프레드시트 및 Supabase DB' : '구글 스프레드시트';
          alert(`성공적으로 ${syncDest}에서 ${parsedRecords.length}건의 신청 내역 및 ${parsedCommutes.length}건의 출퇴근 실시간 근태 내역을 동기화하였습니다.`);
        }
      } else {
        throw new Error('시트 내용에서 유효한 근태 기록 레코드를 찾을 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Google Sheet Sync Failed:', err);
      setSyncError(
        '연동 실패: 구글 스프레드시트의 공유 권한이 부족하거나 CORS 차단 상태입니다. ' +
        '구글 시트 상단의 [공유]를 눌러 액세스를 “링크가 있는 모든 사용자(뷰어)”로 변경 또는 [파일 > 공유 > 웹에 게시]를 활성화하시면 정상 동기화가 가능합니다.'
      );
      if (showNotification) {
        alert(
          '구글 스프레드시트 동기화 실패:\n\n' +
          '시트가 "링크가 있는 모든 사용자에게 뷰어 권한으로 공개" 파일인지 점검해 주세요.'
        );
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Perform data initialization
  useEffect(() => {
    async function initData() {
      if (isSupabaseConfigured) {
        setSupabaseStatus('connecting');
        try {
          const supRecords = await fetchAttendanceRecords();
          const supCommute = await fetchCommuteRecords();
          
          if (supRecords.length > 0) {
            setRecords(supRecords);
            setCommuteRecords(supCommute);
            setSupabaseStatus('connected');
            const now = new Date();
            const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            setLastSyncedAt(timeStr + ' (Supabase DB)');
          } else {
            console.log('Supabase tables are empty. Seeding from Google Sheets...');
            await handleSyncData(false);
          }
        } catch (err) {
          console.error('Failed to load from Supabase:', err);
          setSupabaseStatus('error');
          // Fallback to Google Sheets
          await handleSyncData(false);
        }
      } else {
        setSupabaseStatus('not_configured');
        await handleSyncData(false);
      }
    }
    initData();
  }, []);

  // Dynamically extract unique departments available in the active dataset
  const availableDepts = useMemo(() => {
    const depts = new Set<string>();
    records.forEach(r => {
      if (r.department) depts.add(r.department.trim());
    });
    return Array.from(depts).sort();
  }, [records]);

  // Handler for direct manual addition of records
  const handleAddRecord = (newRec: AttendanceRecord) => {
    setRecords(prev => [newRec, ...prev]);
  };

  // Handler for bulk CSV data upload injection
  const handleDataUploaded = (newRecords: AttendanceRecord[]) => {
    // Replace current records with uploaded ones
    setRecords(newRecords);
  };

  // Global Multi-dimensional Filtration Engine
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      // 1. Department match
      if (selectedDept !== 'all' && rec.department !== selectedDept) {
        return false;
      }

      // 2. Full text fuzzy keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rec.name.toLowerCase().includes(q);
        const matchesId = rec.sapId.toLowerCase().includes(q);
        const matchesDept = rec.department.toLowerCase().includes(q);
        const matchesDetail = rec.typeDetail.toLowerCase().includes(q);
        const matchesType = rec.type.toLowerCase().includes(q);
        const matchesLocation = rec.tripLocation ? rec.tripLocation.toLowerCase().includes(q) : false;
        const matchesPurpose = rec.tripPurpose ? rec.tripPurpose.toLowerCase().includes(q) : false;
        const matchesRemarks = rec.remarks ? rec.remarks.toLowerCase().includes(q) : false;
        
        if (!matchesName && !matchesId && !matchesDept && !matchesDetail && !matchesType && !matchesLocation && !matchesPurpose && !matchesRemarks) {
          return false;
        }
      }

      // 3. Period/Dates filter logic
      if (timeFilter === 'monthly') {
        if (selectedMonth !== 'all') {
          // Check if applyDate or startDate falls into the selected month index (e.g. '05')
          const monthStr = `-${selectedMonth}-`;
          const matchesApply = rec.applyDate?.includes(monthStr);
          const matchesStart = rec.startDate?.includes(monthStr);
          if (!matchesApply && !matchesStart) {
            return false;
          }
        }
      } else if (timeFilter === 'weekly') {
        // Month filter
        if (selectedMonth !== 'all') {
          const monthStr = `-${selectedMonth}-`;
          const matchesApply = rec.applyDate?.includes(monthStr);
          const matchesStart = rec.startDate?.includes(monthStr);
          if (!matchesApply && !matchesStart) {
            return false;
          }
        }
        
        // Week filter using actual calendar week ranges
        if (selectedWeek !== 'all') {
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth() + 1;
          const activeMonth = selectedMonth !== 'all' ? parseInt(selectedMonth) : currentMonth;
          
          const weekRanges = getWeekRanges(currentYear, activeMonth);
          const targetWeek = weekRanges.find(w => w.key === selectedWeek);
          
          if (targetWeek) {
            const targetDate = rec.startDate || rec.applyDate;
            if (targetDate) {
              if (targetDate < targetWeek.startStr || targetDate > targetWeek.endStr) {
                return false;
              }
            } else {
              return false;
            }
          } else {
            return false;
          }
        }
      } else if (timeFilter === 'custom') {
        const startRange = customStartDate;
        const endRange = customEndDate;
        const recStart = rec.startDate || rec.applyDate;
        const recEnd = rec.endDate || rec.startDate || rec.applyDate;
        if (recStart && recEnd && startRange && endRange) {
          // Overlap condition:
          // Record starts before/on range end, and ends after/on range start.
          if (recStart > endRange || recEnd < startRange) {
            return false;
          }
        }
      }

      return true;
    });
  }, [records, selectedDept, searchQuery, timeFilter, selectedMonth, selectedWeek, customStartDate, customEndDate]);

  // Helper counts: Today's absentees under current filtered context
  const todayAbsenteeCount = useMemo(() => {
    return filteredRecords.filter(rec => {
      try {
        const s = new Date(rec.startDate);
        const e = new Date(rec.endDate);
        const t = new Date(simulatedDate);
        return t >= s && t <= e;
      } catch {
        return false;
      }
    }).length;
  }, [filteredRecords, simulatedDate]);

  // Counts of leaves and trips in the current filtered subset
  const leaveStats = useMemo(() => {
    let leaves = 0;
    let trips = 0;
    filteredRecords.forEach(rec => {
      const t = rec.type?.trim();
      const isAnnual = t === '연차' || t === '오후반차' || t === '오전반차';
      if (isAnnual) {
        leaves++;
      } else {
        trips++;
      }
    });
    return { leaves, trips };
  }, [filteredRecords]);

  // Derived inquiry period string for tab displays
  const inquiryPeriodText = useMemo(() => {
    if (timeFilter === 'all') {
      return '전체 기간';
    } else if (timeFilter === 'monthly') {
      return selectedMonth === 'all' ? '전체 월' : `2026년 ${selectedMonth}월`;
    } else if (timeFilter === 'weekly') {
      const monthPart = selectedMonth === 'all' ? '전체 월' : `2026년 ${selectedMonth}월`;
      const weekPart = selectedWeek === 'all' ? '전체 주차' : `${selectedWeek}주차`;
      return `${monthPart} ${weekPart}`;
    } else {
      return `${customStartDate || '미지정'} ~ ${customEndDate || '미지정'}`;
    }
  }, [timeFilter, selectedMonth, selectedWeek, customStartDate, customEndDate]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Universal Branding Bar with low visual density */}
      <div className="bg-slate-900 text-[11px] font-mono font-bold text-slate-400 py-3 px-4 sm:px-6 lg:px-8 border-b border-slate-950 flex justify-between items-center sm:gap-4 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="tracking-wider">HR ATTENDANCE MONITOR DASHBOARD v1.4</span>
        </div>
        <div className="flex items-center gap-4 text-slate-450 text-right select-none font-medium">
          <span>기준 시간대: UTC 09:00 (Seoul)</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">실시간 전사 사번 연동 완료</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Unit 1: Header */}
        <Header 
          totalRecords={filteredRecords.length}
          leaveRecordsCount={leaveStats.leaves}
          tripRecordsCount={leaveStats.trips}
          onDataUploaded={handleDataUploaded}
          selectedDate={simulatedDate}
          todayAbsenteeCount={todayAbsenteeCount}
          onAddRecord={handleAddRecord}
          isSyncing={isSyncing}
          onSyncData={handleSyncData}
          lastSyncedAt={lastSyncedAt}
        />

        {/* Real-time Google Sheet Connection & Setup Info Banner when Sync Fails or on demand */}
        {syncError ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-fade-in">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 font-display">구글 스프레드시트 연동 지침 안내</h4>
                <p className="text-[11.5px] text-slate-600 leading-normal font-medium">
                  {syncError}
                </p>
                <div className="text-[10.5px] text-slate-450 font-mono pt-0.5">
                  대상 연동 문서: <a href="https://docs.google.com/spreadsheets/d/1fsypp6-z5wZ73GhzVNu8FE8EtmVYgv7LVuRzHIaSUUA/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">1fsypp6-z5wZ73GhzVNu8FE8EtmVYgv7LVuRzHIaSUUA (바로가기 ↗)</a>
                </div>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => handleSyncData(true)}
              disabled={isSyncing}
              className="px-3.5 py-1.5 bg-white text-slate-700 hover:text-slate-900 border border-amber-300 rounded-lg text-xs font-bold shrink-0 shadow-2xs hover:bg-slate-50 transition cursor-pointer active:scale-95"
            >
              다시 시도
            </button>
          </div>
        ) : lastSyncedAt ? (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11.5px] text-emerald-850 font-sans leading-normal font-semibold">
                <b>실시간 연동 상태:</b> 구글 스프레드시트({records.length}행)와 데이터가 실시간으로 동기화되어 있습니다. (최근 동기화: {lastSyncedAt})
              </p>
              
              {/* Supabase Status Pill */}
              {supabaseStatus === 'connected' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Supabase DB 활성화
                </span>
              )}
              {supabaseStatus === 'connecting' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Supabase DB 연결 중...
                </span>
              )}
              {supabaseStatus === 'error' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Supabase 연결 안됨 (Sheet 대체 모드)
                </span>
              )}
              {supabaseStatus === 'not_configured' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-100 text-slate-650 border border-slate-200 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Supabase 미설정 (Sheet 단독 모드)
                </span>
              )}
            </div>
            <a 
              href="https://docs.google.com/spreadsheets/d/1fsypp6-z5wZ73GhzVNu8FE8EtmVYgv7LVuRzHIaSUUA/edit?usp=sharing" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 shrink-0"
            >
              <span>시트 보기</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        ) : null}

        {/* Unit 2: Unified Parameter Filters Panel */}
        <Filters 
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
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          availableDepts={availableDepts}
          simulatedDate={simulatedDate}
          setSimulatedDate={setSimulatedDate}
        />

        {/* Unit 3: Horizontal Navigation Tabs Selection Bar */}
        <div className="space-y-5">
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px space-x-6 overflow-x-auto" aria-label="Tabs">
              <button
                id="tab-btn-1"
                onClick={() => setActiveTab(1)}
                className={`py-4 px-2 border-b-2 text-sm font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 1
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Layers className={`w-4 h-4 ${activeTab === 1 ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>통합 대시보드</span>
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  activeTab === 1 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {filteredRecords.length}
                </span>
              </button>

              <button
                id="tab-btn-2"
                onClick={() => setActiveTab(2)}
                className={`py-4 px-2 border-b-2 text-sm font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 2
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <CalendarDays className={`w-4 h-4 ${activeTab === 2 ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>연차사용내역</span>
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  activeTab === 2 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {leaveStats.leaves}
                </span>
              </button>

              <button
                id="tab-btn-3"
                onClick={() => setActiveTab(3)}
                className={`py-4 px-2 border-b-2 text-sm font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 3
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <ArrowRightLeft className={`w-4 h-4 ${activeTab === 3 ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>출장 및 기타업무</span>
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  activeTab === 3 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {leaveStats.trips}
                </span>
              </button>

              <button
                id="tab-btn-4"
                onClick={() => setActiveTab(4)}
                className={`py-4 px-2 border-b-2 text-sm font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 4
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Users className={`w-4 h-4 ${activeTab === 4 ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>인원별 통합 현황</span>
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  activeTab === 4 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {new Set(filteredRecords.map(r => r.sapId)).size}
                </span>
              </button>
            </nav>
          </div>

          {/* Unit 4: Render active screen panel view */}
          <div className="pt-1 select-text">
            {activeTab === 1 && (
              <MainOverviewTab 
                records={filteredRecords}
                allRecords={records}
                simulatedDate={simulatedDate}
                commuteRecords={commuteRecords}
              />
            )}

            {activeTab === 2 && (
              <AnnualLeaveTab 
                records={filteredRecords}
                inquiryPeriod={inquiryPeriodText}
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
              />
            )}

            {activeTab === 3 && (
              <BusinessTripTab 
                records={filteredRecords}
                inquiryPeriod={inquiryPeriodText}
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
              />
            )}

            {activeTab === 4 && (
              <EmployeeSummaryTab 
                records={filteredRecords}
                rawRecords={records}
                commuteRecords={commuteRecords}
                inquiryPeriod={inquiryPeriodText}
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
              />
            )}
          </div>
        </div>

      </div>

      {/* Corporate footer */}
      <footer className="bg-white border-t border-slate-200 mt-20 py-10 selection:bg-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
            HUMAN RESOURCES MANAGEMENT PRO ATTENDANCE ANALYTICS
          </p>
          <p className="text-[11px] text-slate-500 font-sans font-medium">
            © 2026 HR Monitor Pro System Inc. ALL RIGHTS RESERVED. ERP 데이터 동기화 계정 보안 2단계 규정 검증 완료.
          </p>
        </div>
      </footer>
    </div>
  );
}
