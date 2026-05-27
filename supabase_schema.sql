-- Supabase Schema for HR Attendance Monitor Dashboard
-- Copy and run this in your Supabase SQL Editor

-- Table for main attendance/leave/trip records
CREATE TABLE IF NOT EXISTS attendance_records (
    doc_id VARCHAR(100) PRIMARY KEY,
    apply_date VARCHAR(50) NOT NULL,
    period VARCHAR(255) NOT NULL,
    start_date VARCHAR(50) NOT NULL,
    end_date VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    sap_id VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    type_detail TEXT,
    use_days NUMERIC DEFAULT 1,
    trip_location VARCHAR(255),
    transportation VARCHAR(100),
    trip_purpose TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies (allow anonymous reads and writes for demo purposes, restrict in production)
CREATE POLICY "Allow public read access to attendance_records" 
ON attendance_records FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow public insert/update access to attendance_records" 
ON attendance_records FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);


-- Table for check-in/check-out commute records
CREATE TABLE IF NOT EXISTS commute_records (
    id SERIAL PRIMARY KEY,
    no VARCHAR(100),
    date VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    sap_id VARCHAR(100) NOT NULL,
    start_time VARCHAR(50),
    end_time VARCHAR(50),
    category VARCHAR(100),
    type VARCHAR(100),
    detail TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique combination to support upserts per person per day
    UNIQUE (date, sap_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE commute_records ENABLE ROW LEVEL SECURITY;

-- Create policies for commute records
CREATE POLICY "Allow public read access to commute_records" 
ON commute_records FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow public insert/update access to commute_records" 
ON commute_records FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_dates ON attendance_records (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_commute_date ON commute_records (date);
CREATE INDEX IF NOT EXISTS idx_attendance_dept ON attendance_records (department);
CREATE INDEX IF NOT EXISTS idx_commute_dept ON commute_records (department);
