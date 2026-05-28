/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, UserMinus, CalendarCheck, HelpCircle, Bell, Clock } from 'lucide-react';
import { AttendanceRecord } from '../types';

interface UncheckedEmployee {
  sapId: string;
  name: string;
  department: string;
  position: string;
}

interface CheckedInEmployee {
  sapId: string;
  name: string;
  department: string;
  position: string;
  startTime: string;
  endTime: string;
  type: string;
}

interface TodayUncheckedTabProps {
  uncheckedEmployees: UncheckedEmployee[];
  officialAbsentees: AttendanceRecord[];
  checkedInEmployees: CheckedInEmployee[];
  simulatedDate: string;
  todayAttendanceRate: number;
}

export const TodayUncheckedTab: React.FC<TodayUncheckedTabProps> = ({
  uncheckedEmployees,
  officialAbsentees,
  checkedInEmployees,
  simulatedDate,
  todayAttendanceRate
}) => {
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<'checkedIn' | 'absent'>('checkedIn');

  const handleSendReminder = (empName: string, sapId: string) => {
    setSendingId(sapId);
    
    setTimeout(() => {
      setSendingId(null);
      setNotificationToast(`📢 [${empName} ${sapId}]님에게 알림톡을 성공적으로 전송했습니다!\n(메시지: "금일 출근 기록이 확인되지 않습니다. 늦게라도 출근체크를 진행해주세요.")`);
      
      setTimeout(() => {
        setNotificationToast(null);
      }, 4000);
    }, 800);
  };

  const handleSendAllReminders = () => {
    if (uncheckedEmployees.length === 0) return;
    setSendingId('all');

    setTimeout(() => {
      setSendingId(null);
      setNotificationToast(`📢 미출근 인원 총 ${uncheckedEmployees.length}명에게 출근 독려 일괄 알림톡을 전송했습니다.`);
      setTimeout(() => {
        setNotificationToast(null);
      }, 4500);
    }, 1200);
  };

  return (
    <div id="today-unchecked-tab" className="space-y-6 animate-fade-in relative">
      
      {/* Toast Notification Popup */}
      {notificationToast && (
        <div className="fixed bottom-10 right-10 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl border border-slate-800 z-50 flex items-start gap-3 max-w-md animate-bounce">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-display text-blue-400">알림톡 전송 완료</h4>
            <p className="text-[11.5px] text-slate-350 leading-relaxed whitespace-pre-line font-medium">
              {notificationToast}
            </p>
          </div>
        </div>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs text-center flex flex-col justify-center items-center">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">금일 미출근 (독려 대상)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-rose-600 font-display">{uncheckedEmployees.length}</span>
            <span className="text-sm text-rose-500 font-bold">명</span>
          </div>
        </div>
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs text-center flex flex-col justify-center items-center">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">금일 출근 완료</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-emerald-600 font-display">{checkedInEmployees.length}</span>
            <span className="text-sm text-emerald-500 font-bold">명</span>
          </div>
        </div>
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs text-center flex flex-col justify-center items-center">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">공식 휴가/출장 자</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-slate-700 font-display">{officialAbsentees.length}</span>
            <span className="text-sm text-slate-500 font-bold">명</span>
          </div>
        </div>
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs text-center flex flex-col justify-center items-center">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">연동 출근율 (강남구청점 제외)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-indigo-600 font-display">{todayAttendanceRate}</span>
            <span className="text-sm text-indigo-500 font-bold">%</span>
          </div>
        </div>
      </div>

      {/* Main Stacked Vertical Layout */}
      <div className="space-y-6">
        
        {/* SECTION 1: Unchecked-in Employees */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserMinus className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">금일 미출근 현황 ({simulatedDate})</h3>
                </div>
                <p className="text-xs text-slate-500">더존 출퇴근 태깅 기록이 없고, 결재 완료된 휴가나 출장 신청도 없는 실제 독려 대상 임직원 명단입니다.</p>
              </div>
              
              {uncheckedEmployees.length > 0 && (
                <button
                  type="button"
                  onClick={handleSendAllReminders}
                  disabled={sendingId !== null}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {sendingId === 'all' ? '전송 중...' : '전원 일괄 독려'}
                </button>
              )}
            </div>

            {uncheckedEmployees.length === 0 ? (
              <div className="p-16 text-center text-slate-450 space-y-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">지정일 미출근 대상자가 없습니다!</p>
                  <p className="text-[11px] text-slate-400">모든 재직 임직원이 정상 출근했거나 공식 휴가/출장 결재 처리가 완료되었습니다.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10.5px] font-bold text-slate-500 border-b border-slate-200 select-none">
                      <th className="px-5 py-3">사번</th>
                      <th className="px-5 py-3">성명</th>
                      <th className="px-5 py-3">부서</th>
                      <th className="px-5 py-3">직급</th>
                      <th className="px-5 py-3 text-right">출근 독려</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {uncheckedEmployees.map(emp => (
                      <tr key={emp.sapId} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-3.5 font-bold font-mono text-slate-550">{emp.sapId}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">{emp.name}</td>
                        <td className="px-5 py-3.5 text-slate-600 font-medium">{emp.department}</td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">{emp.position}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleSendReminder(emp.name, emp.sapId)}
                            disabled={sendingId !== null}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[10.5px] font-bold shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3 h-3 text-slate-400" />
                            <span>{sendingId === emp.sapId ? '보내는 중..' : '알림톡'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center gap-2 text-[10px] text-slate-450 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>본 목록은 '재직자현황' 시트를 기준으로 출퇴근 및 상신 기록을 실시간 대조하여 추출한 독려 대상 명단입니다.</span>
          </div>
        </div>

        {/* SECTION 2: Checked-in Employees */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-200/80 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">금일 출근 완료 현황 ({checkedInEmployees.length}명)</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">오늘 정상적으로 출근하여 태깅 기록이 확인된 재직 임직원 명단입니다. 부서별 마감 시각에 따라 출근/지각 여부가 자동으로 계산됩니다.</p>
            </div>

            {checkedInEmployees.length === 0 ? (
              <div className="p-16 text-center text-slate-450 space-y-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">금일 출근 완료한 인원이 없습니다.</p>
                  <p className="text-[11px] text-slate-400">조회 조건 또는 동기화 상태를 확인해 주세요.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="bg-slate-50/20 text-[10.5px] font-bold text-slate-500 border-b border-slate-200 select-none">
                      <th className="px-5 py-3">사번</th>
                      <th className="px-5 py-3">성명</th>
                      <th className="px-5 py-3">부서</th>
                      <th className="px-5 py-3">직급</th>
                      <th className="px-5 py-3">출퇴근 시각</th>
                      <th className="px-5 py-3 text-right">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {checkedInEmployees.map(emp => (
                      <tr key={emp.sapId} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-3.5 font-bold font-mono text-slate-550">{emp.sapId}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">{emp.name}</td>
                        <td className="px-5 py-3.5 text-slate-600 font-medium">{emp.department}</td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">{emp.position}</td>
                        <td className="px-5 py-3.5 font-mono font-semibold text-slate-600">
                          {emp.startTime || '--:--'} ~ {emp.endTime || '--:--'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            emp.type === '지각'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {emp.type || '출근'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-150 flex flex-col gap-1.5 text-[10px] text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>* 출근 제한 기준: 일반 팀은 09:00까지, 센터 및 창업지원팀은 10:00까지 출근해야 정상 출근으로 자동 반영됩니다.</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Official Absentees (Leave / Trip) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-200/80 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">금일 공식 휴가/출장 자 ({officialAbsentees.length}명)</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">오늘 결재 완료(결재종결)된 연차, 반차, 국내/해외출장 등 공식 승인된 부재원 명부입니다.</p>
            </div>

            {officialAbsentees.length === 0 ? (
              <div className="p-16 text-center text-slate-450 space-y-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                  <CalendarCheck className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">지정일 공식 부재자가 없습니다.</p>
                  <p className="text-[11px] text-slate-400">모든 임직원이 현장 출근 대상자입니다.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="bg-slate-50/20 text-[10.5px] font-bold text-slate-500 border-b border-slate-200 select-none">
                      <th className="px-5 py-3">사번</th>
                      <th className="px-5 py-3">성명</th>
                      <th className="px-5 py-3">부서</th>
                      <th className="px-5 py-3">직급</th>
                      <th className="px-5 py-3">근태 구분</th>
                      <th className="px-5 py-3 text-right">결재 상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {officialAbsentees.map((abs, idx) => {
                      const t = abs.type?.trim();
                      const isLeave = t === '연차' || t === '오전반차' || t === '오후반차';
                      return (
                        <tr key={`${abs.sapId}-${idx}`} className="hover:bg-slate-50/50 transition">
                          <td className="px-5 py-3.5 font-bold font-mono text-slate-550">{abs.sapId}</td>
                          <td className="px-5 py-3.5 font-bold text-slate-900">{abs.name}</td>
                          <td className="px-5 py-3.5 text-slate-650 font-medium">{abs.department}</td>
                          <td className="px-5 py-3.5 text-slate-500 font-medium">{abs.position}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isLeave ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'
                            }`}>
                              {abs.type}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-emerald-600 text-[10px] uppercase font-mono">
                            {abs.status}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>이 목록을 확인하여 미출근자 명단을 검증하고, 결재 상신 내역과 출퇴근 상태를 교차 대조할 수 있습니다.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
