/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AttendanceRecord {
  docId: string;         // 문서번호 (e.g., HR-2026-0001)
  applyDate: string;     // 신청일 (e.g., 2026-05-15)
  period: string;        // 기간 (e.g., 2026-05-20 ~ 2026-05-22 or 2026-05-21)
  startDate: string;     // 시작일 (for filtration helper)
  endDate: string;       // 종료일/종결일자 (for filtration helper)
  department: string;    // 부서
  position: string;      // 직급
  name: string;          // 이름
  sapId: string;         // ERP사번
  status: string;        // 상태 (e.g., 결재종결, 결재중, 결재대기)
  category: string;      // 근태항목 (e.g., 법정휴가, 출장, 기타휴가)
  type: string;          // 근태구분 (e.g., 연차, 반차, 국내출장, 보상휴가)
  typeDetail: string;    // 신청내역 / 사유
  useDays?: number;      // 사용일수 (mainly for leave)
  tripLocation?: string; // 출장지
  transportation?: string; // 교통수단
  tripPurpose?: string;  // 출장목적
  remarks?: string;      // 비고
}

export interface CommuteRecord {
  no: string;
  date: string;          // YYYYMMDD string format (e.g. '20260521')
  department: string;    // 부서명
  position: string;      // 직급
  name: string;          // 성명
  sapId: string;         // ERP 사번
  startTime: string;     // 출근시각
  endTime: string;       // 퇴근시각
  category: string;      // 근태항목 (e.g. 출퇴근, 법정휴가, 출장)
  type: string;          // 근태구분 (e.g. 정상, 출근, 지각, 연차, 국내출장)
  detail: string;        // 신청내역
}

export type TimeFilterType = 'all' | 'weekly' | 'monthly' | 'custom';

