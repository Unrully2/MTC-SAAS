# Mercylife ERP - Database Schema Documentation

## Overview
This document describes the complete PostgreSQL database schema for the Mercylife Training College ERP system.

## Tables

### 1. profiles (Users)
Stores user account information synced with Supabase Auth.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  phone TEXT,
  avatar_url TEXT,
  national_id TEXT,
  gender TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Roles**: administrator, principal, registrar, finance_officer, lecturer, librarian, reception, student

---

### 2. academic_years
Manages academic year information and semesters.

```sql
CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_code TEXT UNIQUE NOT NULL, -- '2025/2026'
  current_semester TEXT NOT NULL DEFAULT 'Semester 1',
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3. intakes
Manages student intakes (cohorts).

```sql
CREATE TABLE intakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- 'January 2026', 'May 2026'
  academic_year_id UUID REFERENCES academic_years(id),
  status TEXT DEFAULT 'open', -- 'open', 'closed'
  start_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4. courses
Medical training programs offered.

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- 'DCM-101'
  name TEXT NOT NULL, -- 'Diploma in Clinical Medicine'
  department TEXT NOT NULL,
  duration_months INT NOT NULL DEFAULT 36,
  fees_per_semester NUMERIC(12,2) NOT NULL,
  description TEXT,
  requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5. units
Course units/modules.

```sql
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- 'ANA-101'
  name TEXT NOT NULL, -- 'Human Anatomy & Physiology'
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  semester TEXT NOT NULL, -- 'Semester 1'
  credit_hours INT DEFAULT 45,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 6. students
Student enrollment records.

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admission_no TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  national_id TEXT,
  date_of_birth DATE,
  gender TEXT,
  county TEXT,
  status student_status DEFAULT 'active',
  admission_date DATE,
  graduation_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Status**: active, inactive, suspended, deferred, graduated, discontinued

---

### 7. staff
Lecturer and staff records.

```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  title TEXT,
  department TEXT,
  email TEXT,
  phone TEXT,
  qualification TEXT,
  hire_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 8. attendance
Student attendance records.

```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id),
  date DATE NOT NULL,
  status attendance_status NOT NULL, -- 'present', 'absent', 'late', 'excused'
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 9. exam_results
Student exam and CAT marks.

```sql
CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id),
  exam_type exam_type NOT NULL, -- 'cat', 'midterm', 'final', 'practical'
  cat_score NUMERIC(5,2),
  exam_score NUMERIC(5,2),
  total_score NUMERIC(5,2),
  grade TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 10. invoices
Student fee invoices.

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_no TEXT UNIQUE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  balance NUMERIC(12,2),
  due_date DATE,
  status invoice_status DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 11. payments
Payment transaction records.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_no TEXT UNIQUE NOT NULL,
  invoice_id UUID REFERENCES invoices(id),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  method payment_method NOT NULL, -- 'cash', 'bank', 'cheque', 'mpesa'
  mpesa_ref TEXT,
  received_by TEXT,
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 12. books
Library book records.

```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  isbn TEXT UNIQUE,
  title TEXT NOT NULL,
  author TEXT,
  category TEXT,
  publisher TEXT,
  publication_year INT,
  quantity INT DEFAULT 1,
  available INT DEFAULT 1,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 13. book_borrowing
Book borrowing and return records.

```sql
CREATE TABLE book_borrowing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id),
  borrow_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  status book_borrow_status DEFAULT 'borrowed',
  fine_amount NUMERIC(8,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 14. clinical_attachments
Clinical rotation assignments.

```sql
CREATE TABLE clinical_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  hospital TEXT NOT NULL,
  department TEXT NOT NULL,
  supervisor_name TEXT,
  supervisor_email TEXT,
  start_date DATE,
  end_date DATE,
  required_hours INT DEFAULT 200,
  completed_hours INT DEFAULT 0,
  score NUMERIC(5,2),
  status attachment_status DEFAULT 'assigned',
  logbook_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 15. notices
Campus announcements.

```sql
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  posted_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indexes (Performance Optimization)

```sql
-- Frequently queried columns
CREATE INDEX idx_students_course_id ON students(course_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_exam_results_student_id ON exam_results(student_id);
CREATE INDEX idx_invoices_student_id ON invoices(student_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_book_borrowing_student_id ON book_borrowing(student_id);
CREATE INDEX idx_clinical_attachments_student_id ON clinical_attachments(student_id);
CREATE INDEX idx_notices_posted_date ON notices(posted_date DESC);
```

---

## Row Level Security (RLS) Policies

### profiles
- Users can view their own profile
- Admins can view all profiles
- Lecturers can view student profiles

### students
- Students can view their own record
- Admins can view all students
- Registrar can view all students
- Lecturers can view class roster

### invoices & payments
- Students can view their own invoices
- Finance officer can view all invoices
- Admins can view all invoices

### attendance & exam_results
- Students can view their own records
- Lecturers can view class records
- Admins can view all records

---

## Data Integrity

### Constraints
- Foreign keys enforce referential integrity
- Unique constraints on key identifiers
- NOT NULL constraints on required fields
- CHECK constraints for valid values

### Cascade Rules
- Deleting student cascades to attendance, grades, invoices
- Deleting course cascades to units, student enrollments
- Deleting book cascades to borrowing records

---

## Backup Strategy

- Supabase: Automated daily backups
- Retention: 7 days
- Recovery: Point-in-time restore available
- Testing: Weekly backup restore test

---

**Last Updated**: September 2026
**Schema Version**: 1.0.0
