/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, UserMinus, CalendarCheck, HelpCircle, Bell } from 'lucide-react';
import { AttendanceRecord } from '../types';

interface UncheckedEmployee {
  sapId: string;
  name: string;
  department: string;
  position: string;
}

interface TodayUncheckedTabProps {
  uncheckedEmployees: UncheckedEmployee[];
  officialAbsentees: AttendanceRecord[];
  simulatedDate: string;
  todayAttendanceRate: number;
}

export const TodayUncheckedTab: React.FC<TodayUncheckedTabProps> = ({
  uncheckedEmployees,
  officialAbsentees,
  simulatedDate,
  todayAttendanceRate
}) => {
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleSendReminder = (empName: string, sapId: string) => {
    setSendingId(sapId);
    
    // Simulate API call with delay
    setTimeout(() => {
      setSendingId(null);
      setNotificationToast(`📢 [${empName} ${sapId}]님에게 알림톡을 성공적으로 전송했습니다!\n(메시지: "금일 출근 기록이 확인되지 않습니다. 늦게라도 출근체크를 진행해주세요.")`);
      
      // Auto-hide toast after 4 seconds
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs text-center flex flex-col justify-center items-center">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">금일 미출근 (독려 대상)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-rose-600 font-display">{uncheckedEmployees.length}</span>
            <span className="text-sm text-rose-500 font-bold">명</span>
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
            <span className="text-3xl font-bold font-mono text-emerald-600 font-display">{todayAttendanceRate}</span>
            <span className="text-sm text-emerald-500 font-bold">%</span>
          </div>
        </div>
      </div>

      {/* Main Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Unchecked-in Employees */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserMinus className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">금일 미출근 현황 ({simulatedDate})</h3>
                </div>
                <p className="text-xs text-slate-500">출근 기록이 없고, 결재된 휴가나 출장 신청도 없는 독려 대상자 목록입니다.</p>
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
                  <p className="text-[11px] text-slate-400">모든 근무 대상 임직원이 정상 출근했거나 휴가/출장 결재 처리가 완료되었습니다.</p>
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
            <span>본 목록은 더존 출퇴근 데이터 및 구글 시트에 최종 상신/종결된 근태 데이터와 실시간 크로스 분석한 결과입니다.</span>
          </div>
        </div>

        {/* Right Side: Official Absentees (Leave / Trip) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">오늘의 공식 휴가/출장 자</h3>
                </div>
                <p className="text-xs text-slate-500">결재 완료된 상신건이 있는 인원으로, 금일 정상 출근 의무 제외자입니다.</p>
              </div>
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
                    <tr className="bg-slate-50/50 text-[10.5px] font-bold text-slate-500 border-b border-slate-200 select-none">
                      <th className="px-5 py-3">성명</th>
                      <th className="px-5 py-3">부서</th>
                      <th className="px-5 py-3">근태 구분</th>
                      <th className="px-5 py-3 text-right">문서 상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {officialAbsentees.map((abs, idx) => {
                      const t = abs.type?.trim();
                      const isLeave = t === '연차' || t === '오전반차' || t === '오후반차';
                      return (
                        <tr key={`${abs.sapId}-${idx}`} className="hover:bg-slate-50/50 transition">
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-slate-900">{abs.name}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5 font-mono">{abs.sapId}</span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 font-medium">{abs.department}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isLeave ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'
                            }`}>
                              {abs.type}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-emerald-600 text-[10.5px] uppercase font-mono">
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

          <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center gap-1.5 text-[10px] text-slate-450 font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>이 목록을 확인하여 미출근자에 포함되지 않은 인원의 상신 내역을 역검증(Cross-check)할 수 있습니다.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
