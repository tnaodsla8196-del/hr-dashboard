/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AttendanceRecord, CommuteRecord, EmployeeStatusRecord } from './types';

// Realistic sample dataset reflecting standard HR CSV structures
export const initialAttendanceData: AttendanceRecord[] = [
  {
    docId: "HR-2026-0501",
    applyDate: "2026-05-18",
    period: "2026-05-20 ~ 2026-05-22",
    startDate: "2026-05-20",
    endDate: "2026-05-22",
    department: "개발본부",
    position: "대리",
    name: "김민우",
    sapId: "SAP202401",
    status: "결재종결",
    category: "출장",
    type: "국내출장",
    typeDetail: "부산 지사 시스템 이전 작업 지원",
    tripLocation: "부산 지사",
    transportation: "KTX",
    tripPurpose: "부산 네트워크 교체 및 서버 인프라 이전 마이그레이션 점검",
    remarks: "네트워크팀 동행",
    useDays: 3
  },
  {
    docId: "HR-2026-0502",
    applyDate: "2026-05-19",
    period: "2026-05-21 ~ 2026-05-21",
    startDate: "2026-05-21",
    endDate: "2026-05-21",
    department: "경영지원팀",
    position: "과장",
    name: "이서연",
    sapId: "SAP202205",
    status: "결재종결",
    category: "법정휴가",
    type: "연차",
    typeDetail: "개인 사유 연차 휴가",
    remarks: "가족 행사 참석",
    useDays: 1
  },
  {
    docId: "HR-2026-0503",
    applyDate: "2026-05-20",
    period: "2026-05-21 ~ 2026-05-21",
    startDate: "2026-05-21",
    endDate: "2026-05-21",
    department: "개발본부",
    position: "사원",
    name: "박준혁",
    sapId: "SAP202511",
    status: "결재종결",
    category: "법정휴가",
    type: "반차(오후)",
    typeDetail: "병원 정기 검진으로 인한 오후 반차",
    remarks: "검진 완료 후 익일 출근",
    useDays: 0.5
  },
  {
    docId: "HR-2026-0504",
    applyDate: "2026-05-15",
    period: "2026-05-19 ~ 2026-05-22",
    startDate: "2026-05-19",
    endDate: "2026-05-22",
    department: "글로벌영업부",
    position: "차장",
    name: "정윤호",
    sapId: "SAP201912",
    status: "결재종결",
    category: "출장",
    type: "국내출장",
    typeDetail: "대구/광주 권역 주요 대리점 솔루션 영업 미팅",
    tripLocation: "대구 지사 및 광주 영업소",
    transportation: "자차",
    tripPurpose: "신규 파트너십 체결 및 현장 영업 미팅",
    remarks: "유류비 정산 예정",
    useDays: 4
  },
  {
    docId: "HR-2026-0505",
    applyDate: "2026-05-20",
    period: "2026-05-25 ~ 2026-05-25",
    startDate: "2026-05-25",
    endDate: "2026-05-25",
    department: "마케팅팀",
    position: "과장",
    name: "최수진",
    sapId: "SAP202108",
    status: "결재중",
    category: "법정휴가",
    type: "연차",
    typeDetail: "개인 사유 휴가",
    remarks: "이사 및 관공서 업무",
    useDays: 1
  },
  {
    docId: "HR-2026-0506",
    applyDate: "2026-05-18",
    period: "2026-05-21 ~ 2026-05-21",
    startDate: "2026-05-21",
    endDate: "2026-05-21",
    department: "디자인본부",
    position: "수석 연구원",
    name: "한예슬",
    sapId: "SAP202044",
    status: "결재종결",
    category: "기타근무",
    type: "보상휴가",
    typeDetail: "지난 주말 전시관 부스 운영 지원에 따른 보상휴가 사용",
    remarks: "디자인 페스티벌 참가 대체 휴무",
    useDays: 1
  },
  {
    docId: "HR-2026-0507",
    applyDate: "2026-05-19",
    period: "2026-05-21 ~ 2026-05-22",
    startDate: "2026-05-21",
    endDate: "2026-05-22",
    department: "개발본부",
    position: "선임 연구원",
    name: "이동현",
    sapId: "SAP202219",
    status: "결재종결",
    category: "법정휴가",
    type: "연차",
    typeDetail: "리프레쉬 연차 휴가",
    remarks: "휴식을 통한 재충전",
    useDays: 2
  },
  {
    docId: "HR-2026-0508",
    applyDate: "2026-05-17",
    period: "2026-05-21 ~ 2026-05-21",
    startDate: "2026-05-21",
    endDate: "2026-05-21",
    department: "마케팅팀",
    position: "대리",
    name: "송지훈",
    sapId: "SAP202315",
    status: "결재결정대기",
    category: "출장",
    type: "국내출장",
    typeDetail: "강남 오프라인 팝업스토어 현장 모니터링 및 세팅",
    tripLocation: "서울 강남구 역삼동",
    transportation: "대중교통",
    tripPurpose: "프로모션 대행사 미팅 및 현장 설치 점검",
    remarks: "현장 출근 예정",
    useDays: 1
  },
  {
    docId: "HR-2026-0509",
    applyDate: "2026-05-14",
    period: "2026-05-18 ~ 2026-05-18",
    startDate: "2026-05-18",
    endDate: "2026-05-18",
    department: "경영지원팀",
    position: "사원",
    name: "윤아라",
    sapId: "SAP202502",
    status: "결재종결",
    category: "법정휴가",
    type: "연차",
    typeDetail: "개인 사정 휴가",
    remarks: "은행 업무 및 법률 상담",
    useDays: 1
  },
  {
    docId: "HR-2026-0510",
    applyDate: "2026-05-13",
    period: "2026-05-15 ~ 2026-05-15",
    startDate: "2026-05-15",
    endDate: "2026-05-15",
    department: "디자인본부",
    position: "전임 연구원",
    name: "강하늘",
    sapId: "SAP202418",
    status: "결재종결",
    category: "법정휴가",
    type: "반차(오전)",
    typeDetail: "가계 계약 및 행정 서류 발급차 오전 반차",
    remarks: "오후 2시 정상 출근",
    useDays: 0.5
  },
  {
    docId: "HR-2026-0511",
    applyDate: "2026-05-12",
    period: "2026-05-14 ~ 2026-05-15",
    startDate: "2026-05-14",
    endDate: "2026-05-15",
    department: "글로벌영업부",
    position: "사원",
    name: "박지성",
    sapId: "SAP202506",
    status: "결재종결",
    category: "출장",
    type: "국내출장",
    typeDetail: "세종시 행정안전부 납품 미팅 및 시연",
    tripLocation: "세종시 정부청사",
    transportation: "KTX",
    tripPurpose: "공공 솔루션 납품 일정 조율 및 세크리터리 시연",
    remarks: "영업 차장 동석",
    useDays: 2
  },
  {
    docId: "HR-2026-0512",
    applyDate: "2026-05-10",
    period: "2026-05-12 ~ 2026-05-12",
    startDate: "2026-05-12",
    endDate: "2026-05-12",
    department: "개발본부",
    position: "수석 연구원",
    name: "조현우",
    sapId: "SAP201502",
    status: "결재종결",
    category: "기타근무",
    type: "보상휴가",
    typeDetail: "프로젝트 런칭 철야 작업에 대한 보상휴무",
    remarks: "팀장 전결 건",
    useDays: 1
  },
  {
    docId: "HR-2026-0513",
    applyDate: "2026-05-15",
    period: "2026-05-19 ~ 2026-05-19",
    startDate: "2026-05-19",
    endDate: "2026-05-19",
    department: "경영지원팀",
    position: "부장",
    name: "백단우",
    sapId: "SAP201201",
    status: "결재종결",
    category: "법정휴가",
    type: "연차",
    typeDetail: "가족 추모 행사 참석",
    remarks: "조의 보상 연차",
    useDays: 1
  },
  {
    docId: "HR-2026-0511",
    applyDate: "2026-05-19",
    period: "2026-05-21 ~ 2026-05-21",
    startDate: "2026-05-21",
    endDate: "2026-05-21",
    department: "글로벌영업부",
    position: "부장",
    name: "장성호",
    sapId: "SAP201402",
    status: "결재중",
    category: "출장",
    type: "국내출장",
    typeDetail: "대전 거래처 긴급 기술 장애 대응 미팅",
    tripLocation: "대전 테크노밸리",
    transportation: "KTX",
    tripPurpose: "고객사 서버 트러블 대면 미팅 및 사과 대응",
    remarks: "수정 개발자 비상 대기 지원 요청",
    useDays: 1
  },
  {
    docId: "HR-2026-0520",
    applyDate: "2026-05-20",
    period: "2026-05-22 ~ 2026-05-22",
    startDate: "2026-05-22",
    endDate: "2026-05-22",
    department: "디자인본부",
    position: "연구원",
    name: "오세정",
    sapId: "SAP202522",
    status: "결재대기",
    category: "법정휴가",
    type: "반차(오후)",
    typeDetail: "이사 계약 체결",
    remarks: "오전 업무 수행 후 외출",
    useDays: 0.5
  }
];

/**
 * Fuzzy CSV parser that is highly robust.
 * Maps parsed headers to our `AttendanceRecord` format based on Korean and English keywords.
 */
export function parseCSVToRecords(csvText: string): AttendanceRecord[] {
  if (!csvText || !csvText.trim()) return [];

  // Split by line and filter empty lines
  const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length < 2) return [];

  // Determine delimiter (comma, tab, or semi-colon)
  let delimiter = ',';
  const firstLine = lines[0];
  const commas = (firstLine.match(/,/g) || []).length;
  const tabs = (firstLine.match(/\t/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  if (tabs > commas && tabs > semicolons) delimiter = '\t';
  else if (semicolons > commas && semicolons > tabs) delimiter = ';';

  // Parser helper to handle quotes properly
  const parseRow = (rowText: string): string[] => {
    const result: string[] = [];
    let insideQuote = false;
    let entry = '';
    
    for (let i = 0; i < rowText.length; i++) {
      const char = rowText[i];
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === delimiter && !insideQuote) {
        result.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    result.push(entry.trim());
    return result;
  };

  const rawHeaders = parseRow(lines[0]);

  // Design mapping fields index table
  const mapping: { [key in keyof AttendanceRecord]?: number } = {};

  const findHeaderIndex = (keywords: string[]): number => {
    return rawHeaders.findIndex(header => {
      const lowerHeader = header.toLowerCase().replace(/\s+/g, '');
      return keywords.some(kw => lowerHeader.includes(kw.toLowerCase()));
    });
  };

  const keywordMap: { [key in keyof AttendanceRecord]: string[] } = {
    docId: ['문서번호', '문서', 'docid', 'docno', 'document'],
    applyDate: ['신청일자', '신청일', 'applydate', 'requestdate'],
    period: ['기간', '일시', '일정', 'period', 'duration'],
    startDate: ['시작일', '시작', 'startdate', 'start'],
    endDate: ['종결일자', '종결일', '종료일', 'enddate', 'end'],
    department: ['부서명', '부서', 'dept', 'dep', 'department'],
    position: ['직급', '직책', '직위', 'rank', 'position', 'grade'],
    name: ['이름', '성명', '직원명', 'name', 'employee'],
    sapId: ['erp사번', 'erp', '사번', 'sapid', 'empid', 'id'],
    status: ['상태', '결재상태', 'status', 'state'],
    category: ['근태항목', '분류', '항목', 'category', 'category_name'],
    type: ['근태구분', '구분', 'type', 'leavetype'],
    typeDetail: ['신청내역', '사유', '상세', 'detail', 'reason', 'contents'],
    useDays: ['사용일수', 'usedays', 'days'],
    tripLocation: ['출장지', '목적지', 'location', 'destination'],
    transportation: ['교통수단', '교통', 'transport', 'transportation'],
    tripPurpose: ['출장목적', '출장사유', 'purpose'],
    remarks: ['비고', '특이사항', 'remarks', 'remark', 'note', 'comment']
  };

  // Build the column mapping indices
  Object.keys(keywordMap).forEach(key => {
    const field = key as keyof AttendanceRecord;
    const idx = findHeaderIndex(keywordMap[field]);
    if (idx !== -1) {
      mapping[field] = idx;
    }
  });

  const parsedRecords: AttendanceRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCells = parseRow(lines[i]);
    if (rawCells.length < 2) continue; // Skip empty/broken rows

    const getVal = (field: keyof AttendanceRecord, defaultVal: string = ''): string => {
      const idx = mapping[field];
      if (idx !== undefined && idx < rawCells.length) {
        return rawCells[idx];
      }
      return defaultVal;
    };

    const docId = getVal('docId', `CSV-REC-${i.toString().padStart(4, '0')}`);
    const applyDate = getVal('applyDate', new Date().toISOString().substring(0, 10));
    const period = getVal('period', applyDate);
    // Map department and position from the CSV headers dynamically.
    // Fall back to index 4 (5th column) for department and index 5 (6th column) for position if headers are missing.
    let department = getVal('department');
    if (!department && rawCells.length > 4) {
      department = rawCells[4].trim();
    }
    if (!department) {
      department = '미정';
    }
    if (department && department.includes('노랑통닭 강남구청점')) {
      department = department.replace('노랑통닭 강남구청점', '강남구청점');
    }
    
    let position = getVal('position');
    if (!position && rawCells.length > 5) {
      position = rawCells[5].trim();
    }
    if (!position) {
      position = '사원';
    }
    const name = getVal('name', '미기재');
    const sapId = getVal('sapId', `ERP-${Math.floor(100000 + Math.random() * 900000)}`);
    const status = getVal('status', '결재종결');
    const category = getVal('category', '');
    let type = getVal('type', '');
    if (type === '반차(오후)' || type === '오후반차_') {
      type = '오후반차';
    } else if (type === '반차(오전)' || type === '오전반차_') {
      type = '오전반차';
    }
    const typeDetail = getVal('typeDetail', '');
    const tripLocation = getVal('tripLocation');
    const transportation = getVal('transportation');
    const tripPurpose = getVal('tripPurpose');
    const remarks = getVal('remarks');

    // Infers start Date and End date from Period string if missing
    let parsedStartDate = applyDate;
    let parsedEndDate = applyDate;

    if (period) {
      const matches = period.match(/(\d{4}[-/.]\d{2}[-/.]\d{2})/g);
      if (matches && matches.length >= 1) {
        parsedStartDate = matches[0].replace(/\./g, '-');
        parsedEndDate = (matches.length >= 2 ? matches[1] : matches[0]).replace(/\./g, '-');
      }
    }

    // Try to infer Category and Type if they are empty
    let finalCategory = category;
    let finalType = type;

    if (finalType === '반차(오후)' || finalType === '오후반차_') {
      finalType = '오후반차';
    } else if (finalType === '반차(오전)' || finalType === '오전반차_') {
      finalType = '오전반차';
    }

    if (!finalCategory && !finalType) {
      const detailLower = typeDetail.toLowerCase();
      if (detailLower.includes('출장')) {
        finalCategory = '출장';
        finalType = detailLower.includes('해외') ? '해외출장' : '국내출장';
      } else if (detailLower.includes('연차') || detailLower.includes('휴가') || detailLower.includes('반차')) {
        finalCategory = '법정휴가';
        finalType = detailLower.includes('반차') ? '반차' : '연차';
      } else if (detailLower.includes('보상')) {
        finalCategory = '기타근무';
        finalType = '보상휴가';
      } else {
        finalCategory = '기타근무';
        finalType = '연차';
      }
    } else if (!finalCategory && finalType) {
      if (finalType.includes('출장')) finalCategory = '출장';
      else if (['연차', '반차', '생리휴가', '출산휴가'].some(x => finalType.includes(x))) finalCategory = '법정휴가';
      else finalCategory = '기타근무';
    } else if (finalCategory && !finalType) {
      if (finalCategory.includes('출장')) finalType = '국내출장';
      else if (finalCategory.includes('휴가')) finalType = '연차';
      else finalType = '기타';
    }

    // Try to parse useDays dynamically from headers. 
    // Fall back to index 3 (4th column, i.e. 사용일수) or index 4 (5th column) if headers are missing.
    let useDaysVal = 1;
    let rawUseDays = getVal('useDays');
    if (!rawUseDays && rawCells.length > 3) {
      rawUseDays = rawCells[3];
    }
    
    let parsedUseDays = parseFloat(rawUseDays);
    if (!isNaN(parsedUseDays)) {
      useDaysVal = parsedUseDays;
    } else {
      if (rawCells.length > 4) {
        rawUseDays = rawCells[4];
      }
      parsedUseDays = parseFloat(rawUseDays);
      if (!isNaN(parsedUseDays)) {
        useDaysVal = parsedUseDays;
      } else {
        // Guess use days from period
        if (finalType.includes('반차') || finalType.includes('0.5')) {
          useDaysVal = 0.5;
        } else {
          try {
            const s = new Date(parsedStartDate).getTime();
            const e = new Date(parsedEndDate).getTime();
            if (!isNaN(s) && !isNaN(e) && e >= s) {
              useDaysVal = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
            }
          } catch {
            useDaysVal = 1;
          }
        }
      }
    }

    parsedRecords.push({
      docId,
      applyDate,
      period,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      department,
      position,
      name,
      sapId,
      status,
      category: finalCategory,
      type: finalType,
      typeDetail,
      tripLocation: tripLocation || undefined,
      transportation: transportation || undefined,
      tripPurpose: tripPurpose || undefined,
      remarks: remarks || undefined,
      useDays: useDaysVal
    });
  }

  return parsedRecords;
}

/**
 * Generate standard CSV file header string for downloading template
 */
export function generateCSVTemplateString(): string {
  return "문서번호,신청일자,기간,부서명,직급,이름,erp사번,상태,근태항목,근태구분,신청내역,출장지,교통수단,출장목적,사용일수,비고\n" +
         "HR-2026-9001,2026-05-18,2026-05-20 ~ 2026-05-22,개발본부,대리,김민우,SAP202401,결재종결,출장,국내출장,부산 지사 솔루션 테스트,부산 지사,KTX,현장 납품 시스템 세팅 및 테스트 완료,3,네트워크팀 동행\n" +
         "HR-2026-9002,2026-05-19,2026-05-21 ~ 2026-05-21,경영지원팀,과장,이서연,SAP202205,결재종결,법정휴가,연차,개인 사유 연차 휴가,,,,,1,병원 검진 및 휴식\n" +
         "HR-2026-9003,2026-05-20,2026-05-21 ~ 2026-05-21,개발본부,사원,박준혁,SAP202511,결재종결,법정휴가,반차(오후),안과 검진 외출,,,,,0.5,오후 반차\n" +
         "HR-2026-9004,2026-05-21,2026-05-22 ~ 2026-05-22,디자인본부,수석,한예슬,SAP202044,결재종결,기타근무,보상휴가,지난 전시장 대행 대체보상휴뮤,,,,,1,보상휴가 사용";
}

export function parseCSVToCommuteRecords(csvText: string): CommuteRecord[] {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length < 2) return [];

  // Determine delimiter
  let delimiter = ',';
  const firstLine = lines[0];
  const commas = (firstLine.match(/,/g) || []).length;
  const tabs = (firstLine.match(/\t/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  if (tabs > commas && tabs > semicolons) delimiter = '\t';
  else if (semicolons > commas && semicolons > tabs) delimiter = ';';

  const parseRow = (rowText: string): string[] => {
    const result: string[] = [];
    let insideQuote = false;
    let entry = '';
    
    for (let i = 0; i < rowText.length; i++) {
      const char = rowText[i];
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === delimiter && !insideQuote) {
        result.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    result.push(entry.trim());
    return result;
  };

  const records: CommuteRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const rawCells = parseRow(lines[i]);
    if (rawCells.length < 6) continue;

    const no = rawCells[0]?.replace(/"/g, '') || '';
    const date = rawCells[1]?.replace(/"/g, '') || '';
    let department = rawCells[2]?.replace(/"/g, '') || '';
    if (department && department.includes('노랑통닭 강남구청점')) {
      department = department.replace('노랑통닭 강남구청점', '강남구청점');
    }
    const position = rawCells[3]?.replace(/"/g, '') || '';
    const name = rawCells[4]?.replace(/"/g, '') || '';
    const sapId = rawCells[5]?.replace(/"/g, '') || '';
    const startTime = rawCells[6]?.replace(/"/g, '') || '';
    const endTime = rawCells[7]?.replace(/"/g, '') || '';
    const category = rawCells[8]?.replace(/"/g, '') || '';
    const type = rawCells[9]?.replace(/"/g, '') || '';
    const detail = rawCells[10]?.replace(/"/g, '') || '';

    records.push({
      no,
      date,
      department,
      position,
      name,
      sapId,
      startTime,
      endTime,
      category,
      type,
      detail
    });
  }

  return records;
}

export function parseCSVToEmployeeStatus(csvText: string): EmployeeStatusRecord[] {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length < 2) return [];

  // Determine delimiter
  let delimiter = ',';
  const firstLine = lines[0];
  const commas = (firstLine.match(/,/g) || []).length;
  const tabs = (firstLine.match(/\t/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  if (tabs > commas && tabs > semicolons) delimiter = '\t';
  else if (semicolons > commas && semicolons > tabs) delimiter = ';';

  const parseRow = (rowText: string): string[] => {
    const result: string[] = [];
    let insideQuote = false;
    let entry = '';
    
    for (let i = 0; i < rowText.length; i++) {
      const char = rowText[i];
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === delimiter && !insideQuote) {
        result.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    result.push(entry.trim());
    return result;
  };

  const records: EmployeeStatusRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const rawCells = parseRow(lines[i]);
    if (rawCells.length < 7) continue;

    // Columns: "사원코드","사원명","주민등록번호","부서명","직급명","입사일","퇴사일"...
    const sapId = rawCells[0]?.replace(/"/g, '') || '';
    const name = rawCells[1]?.replace(/"/g, '') || '';
    const department = rawCells[3]?.replace(/"/g, '') || '';
    const position = rawCells[4]?.replace(/"/g, '') || '';
    const joinDate = rawCells[5]?.replace(/"/g, '') || '';
    const retirementDate = rawCells[6]?.replace(/"/g, '') || '';

    if (!sapId) continue;

    records.push({
      sapId,
      name,
      department,
      position,
      joinDate,
      retirementDate
    });
  }

  return records;
}
