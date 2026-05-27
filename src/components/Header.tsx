/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RefreshCw, Layers, PlusCircle } from 'lucide-react';
import { AttendanceRecord } from '../types';
import { parseCSVToRecords } from '../data';

interface HeaderProps {
  totalRecords: number;
  leaveRecordsCount: number;
  tripRecordsCount: number;
  todayAbsenteeCount: number;
  onDataUploaded: (newRecords: AttendanceRecord[]) => void;
  selectedDate: string;
  onAddRecord: (record: AttendanceRecord) => void;
  isSyncing: boolean;
  onSyncData: () => void;
  lastSyncedAt: string;
}

export const Header: React.FC<HeaderProps> = ({
  totalRecords,
  leaveRecordsCount,
  tripRecordsCount,
  todayAbsenteeCount,
  onDataUploaded,
  selectedDate,
  onAddRecord,
  isSyncing,
  onSyncData,
  lastSyncedAt
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const todayStr = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })();

  // Form states for manual record creation
  const [newRecord, setNewRecord] = useState<Partial<AttendanceRecord>>({
    name: '',
    department: '개발본부',
    position: '사원',
    sapId: '',
    category: '법정휴가',
    type: '연차',
    applyDate: todayStr,
    period: `${todayStr} ~ ${todayStr}`,
    startDate: todayStr,
    endDate: todayStr,
    status: '결재종결',
    useDays: 1,
    typeDetail: '',
    tripLocation: '',
    transportation: 'KTX',
    tripPurpose: '',
    remarks: ''
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.name || !newRecord.sapId) {
      alert('이름과 ERP 사번은 필수 항목입니다.');
      return;
    }

    // Infer fields
    const docId = `HR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalRecord: AttendanceRecord = {
      ...newRecord,
      docId,
      startDate: newRecord.startDate || newRecord.applyDate || todayStr,
      endDate: newRecord.endDate || newRecord.applyDate || todayStr
    } as AttendanceRecord;

    onAddRecord(finalRecord);
    setShowAddForm(false);
    // Reset form
    setNewRecord({
      name: '',
      department: '개발본부',
      position: '사원',
      sapId: '',
      category: '법정휴가',
      type: '연차',
      applyDate: todayStr,
      period: `${todayStr} ~ ${todayStr}`,
      startDate: todayStr,
      endDate: todayStr,
      status: '결재종결',
      useDays: 1,
      typeDetail: '',
      tripLocation: '',
      transportation: 'KTX',
      tripPurpose: '',
      remarks: ''
    });
  };

  return (
    <div id="dashboard-header" className="space-y-6">
      {/* Prime Header Block */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-600/10">
              <Layers className="w-4 h-4" />
            </span>
            <div className="text-[10px] font-bold font-mono text-blue-700 uppercase tracking-widest">
              People & Attendance Intelligence
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl font-display">
            전사 근태 인사이트 플랫폼
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            구글 스프레드시트 기반 실시간 데이터 연동 — 연차·반차·출장 현황을 한눈에 파악하고, 데이터 드리븐 HR 의사결정을 지원하는 스마트 분석 대시보드
          </p>
        </div>

        {/* Action Panel */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            id="btn-add-leave" 
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none rounded-lg shadow-sm transition active:scale-[0.98] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            근태 직접 등록
          </button>

          <button 
            id="btn-realtime-sync" 
            onClick={onSyncData}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-60 focus:outline-none rounded-lg border border-blue-200 shadow-xs transition active:scale-[0.98] cursor-pointer"
            title="구글 스프레드시트 근태 데이터와 실시간 동기화를 실행합니다"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? '동기화 중...' : '실시간 동기화'}
          </button>

          {lastSyncedAt && (
            <span className="inline-flex items-center text-[10.5px] font-mono text-slate-500 bg-slate-100/80 px-2.5 py-2 rounded-lg border border-slate-200/60 select-none hidden sm:inline-block">
              동기화: {lastSyncedAt}
            </span>
          )}
        </div>
      </div>

      {/* Manual Registration Form Segment */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="p-6 border border-slate-200 bg-white rounded-xl shadow-md space-y-4 animate-fade-in relative">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-4.5 h-4.5 text-blue-600" />
              신규 근태 데이터 수동 신규 등록
            </h3>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1 hover:bg-slate-50 rounded"
            >
              닫기
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">이름 *</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                placeholder="예: 홍길동"
                value={newRecord.name}
                onChange={e => setNewRecord({...newRecord, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ERP 사번 *</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono" 
                placeholder="예: SAP202611"
                value={newRecord.sapId}
                onChange={e => setNewRecord({...newRecord, sapId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">부서</label>
              <select 
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                value={newRecord.department}
                onChange={e => setNewRecord({...newRecord, department: e.target.value})}
              >
                <option value="개발본부">개발본부</option>
                <option value="경영지원팀">경영지원팀</option>
                <option value="마케팅팀">마케팅팀</option>
                <option value="디자인본부">디자인본부</option>
                <option value="글로벌영업부">글로벌영업부</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">직급</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                placeholder="예: 사원 / 대리 / 과장"
                value={newRecord.position}
                onChange={e => setNewRecord({...newRecord, position: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">근태항목</label>
              <select 
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                value={newRecord.category}
                onChange={e => {
                  const cat = e.target.value;
                  const typ = cat === '출장' ? '국내출장' : '연차';
                  setNewRecord({...newRecord, category: cat, type: typ});
                }}
              >
                <option value="법정휴가">법정휴가</option>
                <option value="출장">출장</option>
                <option value="기타근무">기타근무</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">근태구분</label>
              {newRecord.category === '출장' ? (
                <select 
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  value={newRecord.type}
                  onChange={e => setNewRecord({...newRecord, type: e.target.value})}
                >
                  <option value="국내출장">국내출장</option>
                  <option value="해외출장">해외출장</option>
                </select>
              ) : (
                <select 
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  value={newRecord.type}
                  onChange={e => setNewRecord({...newRecord, type: e.target.value})}
                >
                  <option value="연차">연차</option>
                  <option value="반차(오전)">반차(오전)</option>
                  <option value="반차(오후)">반차(오후)</option>
                  <option value="보상휴가">보상휴가</option>
                  <option value="경조휴가">경조휴가</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">신청일</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono" 
                value={newRecord.applyDate}
                onChange={e => setNewRecord({...newRecord, applyDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">기간 및 일정 범위</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono" 
                value={newRecord.period}
                placeholder={`${todayStr} ~ ${todayStr}`}
                onChange={e => {
                  const val = e.target.value;
                  const parts = val.split('~');
                  const s = parts[0]?.trim() || todayStr;
                  const end = parts[1]?.trim() || s;
                  setNewRecord({...newRecord, period: val, startDate: s, endDate: end});
                }}
              />
            </div>
          </div>

          {newRecord.category === '출장' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <div>
                <label className="block text-xs font-bold text-blue-800 mb-1">출장지</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 text-xs bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  placeholder="예: 부산 지사"
                  value={newRecord.tripLocation}
                  onChange={e => setNewRecord({...newRecord, tripLocation: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-800 mb-1">교통수단</label>
                <select 
                  className="w-full px-3 py-2 text-xs bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  value={newRecord.transportation}
                  onChange={e => setNewRecord({...newRecord, transportation: e.target.value})}
                >
                  <option value="KTX">KTX / 열차</option>
                  <option value="자차">개인 자차</option>
                  <option value="항공">항공편</option>
                  <option value="대중교통">지하철/시내버스/시외버스</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-blue-800 mb-1">출장목적 및 수행업무</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 text-xs bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  placeholder="예: 파트너사 기술 솔루션 점검 미팅 지원"
                  value={newRecord.tripPurpose}
                  onChange={e => setNewRecord({...newRecord, tripPurpose: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">신청내역 및 상세사유</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                placeholder="신청 사유를 구체적으로 기입해 주세요"
                value={newRecord.typeDetail}
                onChange={e => setNewRecord({...newRecord, typeDetail: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">사용일수</label>
              <input 
                type="number" 
                step="0.5"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono" 
                value={newRecord.useDays}
                onChange={e => setNewRecord({...newRecord, useDays: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">비고 (참고사항)</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              placeholder="예: 프로젝트 출시 준비 완료 후 연차 사용 등"
              value={newRecord.remarks}
              onChange={e => setNewRecord({...newRecord, remarks: e.target.value})}
            />
          </div>

          <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition"
            >
              취소
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded-lg transition"
            >
              근태 등록 완료
            </button>
          </div>
        </form>
      )}

      {/* Core Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all duration-300 space-y-2 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">기준 총 근태건수</span>
            <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              전체 기간
            </span>
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono font-display group-hover:text-blue-600 transition-colors">
              {totalRecords}
            </span>
            <span className="text-xs font-semibold text-slate-500">건</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-normal">
            부서별/필터 설정이 반영된 총 레코드수
          </div>
        </div>

        {/* Card 2: Leaves */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all duration-300 space-y-2 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">법정휴가 및 연차비율</span>
            <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-600/10">
              Leaves
            </span>
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono font-display group-hover:text-blue-600 transition-colors">
              {leaveRecordsCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">건</span>
            <span className="text-xs font-bold text-blue-600 font-mono ml-2">
              ({totalRecords > 0 ? Math.round((leaveRecordsCount / totalRecords) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 leading-normal">
            전사인원 중 연차/반차 등 사용 통계
          </div>
        </div>

        {/* Card 3: Trips */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all duration-300 space-y-2 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">출장 및 외부 외근</span>
            <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/10">
              Trip
            </span>
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono font-display group-hover:text-indigo-600 transition-colors">
              {tripRecordsCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">건</span>
            <span className="text-xs font-bold text-indigo-600 font-mono ml-2">
              ({totalRecords > 0 ? Math.round((tripRecordsCount / totalRecords) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 leading-normal">
            국내외 출장, 대행 및 파견 지원 통계
          </div>
        </div>

        {/* Card 4: Today Active */}
        <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-xs hover:shadow-sm transition-all duration-300 space-y-2 ring-1 ring-blue-500/10 group bg-slate-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">지정일 당일 부재자</span>
            <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-600/20">
              Today Active
            </span>
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-3xl font-bold tracking-tight text-slate-950 font-mono font-display group-hover:text-amber-600 transition-colors">
              {todayAbsenteeCount}
            </span>
            <span className="text-xs font-bold text-slate-900">명</span>
            <span className="text-[10px] text-slate-500 font-normal ml-1 font-mono">
              ({selectedDate})
            </span>
          </div>
          <div className="text-[11px] text-slate-500 leading-normal">
            설정 분석일 부재 휴가/출장 인원 수
          </div>
        </div>
      </div>
    </div>
  );
};
