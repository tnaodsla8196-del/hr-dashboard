/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { AttendanceRecord, CommuteRecord } from './types';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Automatically sanitize URL to prevent PostgREST invalid path routing errors (e.g. trailing slashes, /rest/v1)
if (supabaseUrl) {
  supabaseUrl = supabaseUrl.trim().replace(/\/+$/, '').replace(/\/rest\/v1\/?$/, '');
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set.\n' +
    'The app will run in Google Sheets live synchronization mode.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Convert DB snake_case to Frontend camelCase
function mapDbToAttendanceRecord(row: any): AttendanceRecord {
  return {
    docId: row.doc_id,
    applyDate: row.apply_date,
    period: row.period,
    startDate: row.start_date,
    endDate: row.end_date,
    department: row.department,
    position: row.position,
    name: row.name,
    sapId: row.sap_id,
    status: row.status,
    category: row.category,
    type: row.type,
    typeDetail: row.type_detail || '',
    useDays: row.use_days !== null && row.use_days !== undefined ? Number(row.use_days) : undefined,
    tripLocation: row.trip_location || undefined,
    transportation: row.transportation || undefined,
    tripPurpose: row.trip_purpose || undefined,
    remarks: row.remarks || undefined,
  };
}

// Convert Frontend camelCase to DB snake_case
function mapAttendanceRecordToDb(rec: AttendanceRecord) {
  return {
    doc_id: rec.docId,
    apply_date: rec.applyDate,
    period: rec.period,
    start_date: rec.startDate,
    end_date: rec.endDate,
    department: rec.department,
    position: rec.position,
    name: rec.name,
    sap_id: rec.sapId,
    status: rec.status,
    category: rec.category,
    type: rec.type,
    type_detail: rec.typeDetail || null,
    use_days: rec.useDays !== undefined ? rec.useDays : null,
    trip_location: rec.tripLocation || null,
    transportation: rec.transportation || null,
    trip_purpose: rec.tripPurpose || null,
    remarks: rec.remarks || null,
  };
}

// Fetch all attendance records from Supabase
export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching attendance records from Supabase:', error);
    throw error;
  }

  return (data || []).map(mapDbToAttendanceRecord);
}

// Bulk upsert attendance records to Supabase
export async function upsertAttendanceRecords(records: AttendanceRecord[]): Promise<void> {
  if (!supabase) return;
  const dbRows = records.map(mapAttendanceRecordToDb);

  // Split into chunks of 100 to avoid request size limits
  const chunkSize = 100;
  for (let i = 0; i < dbRows.length; i += chunkSize) {
    const chunk = dbRows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('attendance_records')
      .upsert(chunk, { onConflict: 'doc_id' });

    if (error) {
      console.error('Error upserting attendance records to Supabase:', error);
      throw error;
    }
  }
}

// Fetch all commute records from Supabase
export async function fetchCommuteRecords(): Promise<CommuteRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('commute_records')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching commute records from Supabase:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    no: row.no || '',
    date: row.date,
    department: row.department,
    position: row.position,
    name: row.name,
    sapId: row.sap_id,
    startTime: row.start_time || '',
    endTime: row.end_time || '',
    category: row.category || '',
    type: row.type || '',
    detail: row.detail || '',
  }));
}

// Bulk upsert commute records to Supabase
export async function upsertCommuteRecords(records: CommuteRecord[]): Promise<void> {
  if (!supabase) return;
  const dbRows = records.map((rec) => ({
    no: rec.no || null,
    date: rec.date,
    department: rec.department,
    position: rec.position,
    name: rec.name,
    sap_id: rec.sapId,
    start_time: rec.startTime || null,
    end_time: rec.endTime || null,
    category: rec.category || null,
    type: rec.type || null,
    detail: rec.detail || null,
  }));

  // Split into chunks of 100
  const chunkSize = 100;
  for (let i = 0; i < dbRows.length; i += chunkSize) {
    const chunk = dbRows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('commute_records')
      .upsert(chunk, { onConflict: 'date,sap_id' });

    if (error) {
      console.error('Error upserting commute records to Supabase:', error);
      throw error;
    }
  }
}
