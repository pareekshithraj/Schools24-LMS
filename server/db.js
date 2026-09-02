import pg from 'pg';
const { Pool } = pg;
import bcrypt from 'bcryptjs';

const connectionString = 'postgresql://neondb_owner:npg_W8wxA7ipkysP@ep-winter-wave-b3a7zel9-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const initDb = async () => {
  const client = await pool.connect();
  try {
    console.log('Connected to Neon PostgreSQL database.');

    // 1. Schools Table (40+ schools) - Legacy LMS compatibility
    await client.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cluster VARCHAR(50) NOT NULL,
        city VARCHAR(100),
        state VARCHAR(100),
        principal VARCHAR(150),
        email VARCHAR(150),
        students_count INT DEFAULT 0,
        teachers_count INT DEFAULT 0,
        cs_lab_systems INT DEFAULT 0,
        internet_status VARCHAR(150),
        rating NUMERIC(3, 1) DEFAULT 4.8,
        status VARCHAR(50) DEFAULT 'Active',
        grades_covered VARCHAR(50) DEFAULT 'Grade 6-12',
        smart_classrooms INT DEFAULT 4,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 1b. New Super Admin Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        city VARCHAR(100),
        state VARCHAR(100),
        admin_name VARCHAR(150),
        admin_email VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL,
        org_id VARCHAR(50),
        password_hash VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150),
        role VARCHAR(50) NOT NULL,
        school_id VARCHAR(50),
        grade VARCHAR(50),
        subject VARCHAR(100),
        roll_no VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(50),
        grade_range VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        grade VARCHAR(50) NOT NULL,
        section VARCHAR(50),
        teacher_id VARCHAR(50),
        student_count INT DEFAULT 0,
        mapped_subjects JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Curriculum Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS curriculum (
        id VARCHAR(50) PRIMARY KEY,
        grade VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        level VARCHAR(50),
        category VARCHAR(100),
        duration VARCHAR(100),
        progress INT DEFAULT 0,
        description TEXT,
        modules JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Live Classes Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS live_classes (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(100) DEFAULT 'Computer Science',
        grade VARCHAR(100),
        teacher VARCHAR(150),
        teacher_role VARCHAR(150),
        start_time VARCHAR(100),
        duration VARCHAR(50),
        status VARCHAR(50) DEFAULT 'UPCOMING',
        attendees_count INT DEFAULT 0,
        schools_connected INT DEFAULT 0,
        meet_code VARCHAR(50),
        target_type VARCHAR(50) DEFAULT 'ALL',
        target_grade VARCHAR(100),
        target_section VARCHAR(50),
        target_student_ids JSONB DEFAULT '[]'::jsonb,
        scheduled_date VARCHAR(50),
        school_id VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Run safe migrations for existing tables
      ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS target_type VARCHAR(50) DEFAULT 'ALL';
      ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS target_grade VARCHAR(100);
      ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS target_section VARCHAR(50);
      ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS target_student_ids JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS scheduled_date VARCHAR(50);
      ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS school_id VARCHAR(50);
    `);

    // 4. Assignments Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        language VARCHAR(50) NOT NULL,
        difficulty VARCHAR(50),
        grade VARCHAR(50),
        points INT DEFAULT 100,
        deadline VARCHAR(100),
        description TEXT,
        starter_code TEXT,
        solution_code TEXT,
        test_cases JSONB,
        submissions_count INT DEFAULT 0,
        passed_count INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Code Submissions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        assignment_id VARCHAR(50) REFERENCES assignments(id) ON DELETE CASCADE,
        student_id VARCHAR(50) NOT NULL,
        student_name VARCHAR(150),
        school_id VARCHAR(50),
        code TEXT,
        status VARCHAR(50) DEFAULT 'passed',
        score INT DEFAULT 100,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Live Attendance Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance_logs (
        id SERIAL PRIMARY KEY,
        class_id VARCHAR(50) REFERENCES live_classes(id) ON DELETE CASCADE,
        student_id VARCHAR(50),
        student_name VARCHAR(150),
        school_id VARCHAR(50),
        school_name VARCHAR(255),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        device_status VARCHAR(100) DEFAULT 'Lab Connected'
      );
    `);

    // Check if schools table is populated
    const res = await client.query('SELECT COUNT(*) FROM schools');
    if (parseInt(res.rows[0].count) === 0) {
      console.log('Seeding initial 42 schools into PostgreSQL database...');
      
      const seedSchools = [
        ['SCH-001', 'Adarsh Vidya Mandir #01 (Central)', 'north', 'Jaipur Rural', 'Rajasthan', 'Dr. Mahendra Pratap', 'principal.avm01@vidyasetu.org', 480, 16, 32, 'Optical Fiber (100 Mbps)', 4.9, 'Active', 'Grade 6-12', 6],
        ['SCH-002', 'Sarvodaya Balika Vidyalaya #04', 'north', 'Alwar Outskirts', 'Rajasthan', 'Mrs. Shashi Prabha', 'principal.sbv04@vidyasetu.org', 410, 14, 28, 'Optical Fiber (50 Mbps)', 4.8, 'Active', 'Grade 6-10', 4],
        ['SCH-003', 'Vivekananda Tribal High School', 'east', 'Ranchi Foothills', 'Jharkhand', 'Mr. Birsa Munda Jr.', 'principal.vths@vidyasetu.org', 390, 12, 24, '5G Fixed Wireless (40 Mbps)', 4.7, 'Active', 'Grade 6-12', 4],
        ['SCH-004', 'Kasturba Gandhi Memorial School #08', 'west', 'Satara Rural', 'Maharashtra', 'Mrs. Vandana Kulkarni', 'principal.kgm08@vidyasetu.org', 520, 18, 36, 'Optical Fiber (100 Mbps)', 4.9, 'Active', 'Grade 6-12', 8],
        ['SCH-005', 'Netaji Subhash Gurukul #12', 'east', 'Purulia', 'West Bengal', 'Prof. Soumitra Das', 'principal.nsg12@vidyasetu.org', 360, 11, 22, 'High-Gain Satellite (25 Mbps)', 4.6, 'Active', 'Grade 6-10', 3],
        ['SCH-006', 'Maharshi Dayanand Vidyapeeth #03', 'south', 'Dharmapuri Rural', 'Tamil Nadu', 'Mr. K. Selvam', 'principal.mdv03@vidyasetu.org', 440, 15, 30, 'Optical Fiber (100 Mbps)', 4.8, 'Active', 'Grade 6-12', 5],
        ['SCH-007', 'Dr. B.R. Ambedkar Model School #19', 'south', 'Kurnool Outskirts', 'Andhra Pradesh', 'Dr. G. Ramana Rao', 'principal.bra19@vidyasetu.org', 490, 17, 34, 'Optical Fiber (100 Mbps)', 4.9, 'Active', 'Grade 6-12', 7],
        ['SCH-008', 'Tagore Memorial Academy #07', 'east', 'Bankura Tribal Belt', 'West Bengal', 'Mrs. Ananya Sen', 'principal.tma07@vidyasetu.org', 340, 10, 20, '4G LTE Mesh (20 Mbps)', 4.5, 'Active', 'Grade 6-10', 3],
        ['SCH-009', 'Sant Dnyaneshwar High School #15', 'west', 'Kolhapur Rural', 'Maharashtra', 'Mr. Eknath Patil', 'principal.sdh15@vidyasetu.org', 430, 13, 26, 'Optical Fiber (50 Mbps)', 4.7, 'Active', 'Grade 6-12', 5],
        ['SCH-010', 'Guru Nanak Foundation School #02', 'north', 'Gurdaspur Outskirts', 'Punjab', 'S. Harpreet Singh', 'principal.gnf02@vidyasetu.org', 470, 15, 32, 'Optical Fiber (100 Mbps)', 4.9, 'Active', 'Grade 6-12', 6],
        ['SCH-011', 'Sardar Patel Vidya Niketan #21', 'west', 'Anand Rural', 'Gujarat', 'Mr. Bhavesh Patel', 'principal.spv21@vidyasetu.org', 395, 12, 25, 'Optical Fiber (50 Mbps)', 4.8, 'Active', 'Grade 6-12', 4],
        ['SCH-012', 'Sri Aurobindo Shanti Niketan #06', 'south', 'Puducherry Rural', 'Puducherry', 'Sister Jayanthi', 'principal.sasn06@vidyasetu.org', 380, 12, 25, 'Optical Fiber (100 Mbps)', 4.9, 'Active', 'Grade 6-12', 5]
      ];

      // Add additional 30 schools to complete 42
      for (let i = 13; i <= 42; i++) {
        const num = i;
        const clusters = ['north', 'south', 'east', 'west'];
        const chosenCluster = clusters[i % 4];
        const states = ['Rajasthan', 'Madhya Pradesh', 'Odisha', 'Karnataka', 'Tamil Nadu', 'Maharashtra'];
        seedSchools.push([
          `SCH-${String(num).padStart(3, '0')}`,
          `VidyaSetu Rural Model School #${num}`,
          chosenCluster,
          `Cluster Hub Zone ${((i % 6) + 1)}`,
          states[i % 6],
          `Principal Officer #${num}`,
          `principal.sch${num}@vidyasetu.org`,
          320 + ((i * 17) % 180),
          10 + (i % 6),
          20 + ((i * 3) % 15),
          i % 3 === 0 ? 'Optical Fiber (100 Mbps)' : 'High-Speed Broadband (50 Mbps)',
          +(4.4 + (i % 5) * 0.1).toFixed(1),
          'Active',
          i % 2 === 0 ? 'Grade 6-12' : 'Grade 6-10',
          3 + (i % 4)
        ]);
      }

      for (const s of seedSchools) {
        await client.query(`
          INSERT INTO schools (id, name, cluster, city, state, principal, email, students_count, teachers_count, cs_lab_systems, internet_status, rating, status, grades_covered, smart_classrooms)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO NOTHING;
        `, s);
      }

      // Seed Live Classes
      await client.query(`
        INSERT INTO live_classes (id, title, subject, grade, teacher, teacher_role, start_time, duration, status, attendees_count, schools_connected, meet_code)
        VALUES 
        ('LIVE-01', 'Python Data Structures: Stacks, Queues & Practical Applications', 'Computer Science', 'Grade 11 - Cluster North & South', 'Prof. Vikram Aditya', 'Senior CS Master Trainer', 'NOW', '60 mins', 'LIVE', 342, 18, 'vst-pycs-live'),
        ('LIVE-02', 'Interactive Web Development: Building Flexbox Portfolios', 'Computer Science', 'Grade 8 - Cluster East & West', 'Ms. Priyanka Sen', 'Lead Web Mentor', 'In 25 Mins', '45 mins', 'UPCOMING', 280, 14, 'vst-web-8b'),
        ('LIVE-03', 'Algorithm Flowcharts & Computational Logic Masterclass', 'Computer Science', 'Grade 6-7 - All 42 Schools', 'Mr. Arvind Swaminathan', 'Trust Head of Pedagogy', 'Today, 4:00 PM', '50 mins', 'UPCOMING', 650, 42, 'vst-all-cs6')
        ON CONFLICT (id) DO NOTHING;
      `);

      // Seed Assignments
      await client.query(`
        INSERT INTO assignments (id, title, language, difficulty, grade, points, deadline, description, starter_code, submissions_count, passed_count)
        VALUES 
        ('CODE-TASK-01', 'Fibonacci Sequence Generator with Memoization', 'python', 'Intermediate', 'Grade 10-11', 100, 'Due Tomorrow, 11:59 PM', 'Write a Python function fibonacci_series(n) that returns first n Fibonacci numbers.', 'def fibonacci_series(n):\n    if n <= 0: return []\n    if n == 1: return [0]\n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[-1] + fib[-2])\n    return fib\n', 1240, 980),
        ('CODE-TASK-02', 'Student Grade & Performance Analyzer', 'python', 'Beginner', 'Grade 9', 75, 'In 3 Days', 'Write a Python function calculate_grade(marks) for student report cards.', 'def calculate_grade(marks):\n    if marks >= 90: return "A"\n    elif marks >= 75: return "B"\n    elif marks >= 50: return "C"\n    return "F"\n', 1850, 1620),
        ('CODE-TASK-03', 'Interactive Responsive School Card (HTML & CSS)', 'html', 'Beginner', 'Grade 8', 50, 'In 5 Days', 'Design a stylish student card using semantic HTML & modern CSS.', '<!DOCTYPE html>\n<html>\n<body><div class="card">Aarav Sharma</div></body>\n</html>', 2100, 1950)
        ON CONFLICT (id) DO NOTHING;
      `);

      // Seed Curriculum
      await client.query(`
        INSERT INTO curriculum (id, grade, title, level, category, duration, progress, description, modules)
        VALUES 
        ('CRS-G06-CS', 'Grade 6', 'Introduction to Computing & Scratch Logic', 'Beginner', 'Block Coding & Flowcharts', '32 Hours (16 Weeks)', 75, 'Fundamental computer concepts, algorithms via visual blocks, and digital safety.', '["Visual Logic", "Scratch Loops", "Flowcharts", "Digital Citizenship"]'::jsonb),
        ('CRS-G07-CS', 'Grade 7', 'Web Foundations: HTML5 & Modern CSS Styling', 'Beginner-Intermediate', 'Web Development', '40 Hours (20 Weeks)', 60, 'Semantic HTML markup, CSS box model, responsive layouts, and simple web design.', '["HTML5 Tags", "CSS Flexbox", "Web Forms", "Portfolio Project"]'::jsonb),
        ('CRS-G08-CS', 'Grade 8', 'Python Foundations & Algorithmic Thinking', 'Intermediate', 'Programming Core', '48 Hours (24 Weeks)', 80, 'Core Python syntax, variables, data types, conditionals, loops, functions, and debugging.', '["Variables & Math", "Conditionals", "Loops", "Functions & Lists"]'::jsonb),
        ('CRS-G09-CS', 'Grade 9', 'Python Problem Solving & Data Structures', 'Intermediate', 'Data Structures & Algorithms', '50 Hours (25 Weeks)', 85, 'Lists, dictionaries, tuples, sets, algorithmic complexity, recursion, and file handling.', '["Data Structures", "Recursion", "Searching & Sorting", "File I/O"]'::jsonb),
        ('CRS-G10-CS', 'Grade 10', 'Object-Oriented Programming & Relational Databases', 'Advanced', 'Software Engineering & SQL', '60 Hours (30 Weeks)', 90, 'OOP classes, inheritance, polymorphism, SQLite database queries, and CRUD apps.', '["OOP Principles", "Inheritance", "SQL Queries", "Capstone Project"]'::jsonb),
        ('CRS-G11-CS', 'Grade 11', 'Advanced Algorithms & Full-Stack Web Development', 'Advanced', 'Full-Stack & Algorithms', '64 Hours (32 Weeks)', 45, 'Trees, graphs, dynamic programming, JavaScript DOM, REST APIs, and client-server architecture.', '["Trees & Graphs", "Dynamic Programming", "JavaScript & APIs", "Full-Stack Project"]'::jsonb),
        ('CRS-G12-CS', 'Grade 12', 'Applied Machine Learning & Distributed Systems', 'Expert', 'Artificial Intelligence & Systems', '64 Hours (32 Weeks)', 30, 'NumPy, Pandas, scikit-learn basics, computer vision intro, model evaluation, and deployment.', '["Data Science Tools", "Supervised ML", "Neural Nets Intro", "Final Capstone"]'::jsonb)
        ON CONFLICT (id) DO NOTHING;
      `);

      console.log('Database seeded successfully.');
    }

    // Seed default Super Admin if not exists
    const adminRes = await client.query('SELECT COUNT(*) FROM admins');
    if (parseInt(adminRes.rows[0].count) === 0) {
      console.log('Seeding default Super Admin account...');
      const defaultPassword = 'superadmin123';
      const hash = await bcrypt.hash(defaultPassword, 10);
      await client.query(
        `INSERT INTO admins (name, email, role, org_id, password_hash) VALUES ($1, $2, $3, $4, $5)`,
        ['Default Super Admin', 'admin@vidyasetu.org', 'trust-admin', 'TRUST-01', hash]
      );
      console.log('Default Super Admin seeded: admin@vidyasetu.org / superadmin123');
    }

    // Seed default Users (Students & Teachers) if empty
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      console.log('Seeding initial students and teachers...');
      const sampleUsers = [
        ['Aarav Sharma', 'aarav.sharma@vidyasetu.org', 'student', 'SCH-001', 'Grade 9', 'Computer Science', '001'],
        ['Pooja Kumari', 'pooja.kumari@vidyasetu.org', 'student', 'SCH-001', 'Grade 9', 'Computer Science', '002'],
        ['Rohan Verma', 'rohan.verma@vidyasetu.org', 'student', 'SCH-001', 'Grade 9', 'Computer Science', '003'],
        ['Sneha Patel', 'sneha.patel@vidyasetu.org', 'student', 'SCH-001', 'Grade 10', 'Computer Science', '004'],
        ['Manoj Munda', 'manoj.munda@vidyasetu.org', 'student', 'SCH-002', 'Grade 9', 'Computer Science', '005'],
        ['Sunita Yadav', 'sunita.yadav@vidyasetu.org', 'student', 'SCH-002', 'Grade 8', 'Computer Science', '006'],
        ['Riya Sen', 'riya.sen@vidyasetu.org', 'student', 'SCH-003', 'Grade 11', 'Computer Science', '007'],
        ['Karan Joshi', 'karan.joshi@vidyasetu.org', 'student', 'SCH-004', 'Grade 10', 'Computer Science', '008'],
        ['Deepak Nayak', 'deepak.nayak@vidyasetu.org', 'student', 'SCH-005', 'Grade 12', 'Computer Science', '009'],
        ['Ananya Iyer', 'ananya.iyer@vidyasetu.org', 'student', 'SCH-006', 'Grade 11', 'Computer Science', '010'],
        ['Prof. Vikram Aditya', 'teacher@vidyasetu.org', 'teacher', 'SCH-001', 'Grade 9-12', 'Computer Science', 'T-01'],
        ['Ms. Priyanka Sen', 'priyanka.sen@vidyasetu.org', 'teacher', 'SCH-001', 'Grade 6-10', 'Web Development', 'T-02'],
        ['Mr. Arvind Swaminathan', 'arvind.s@vidyasetu.org', 'teacher', 'SCH-002', 'Grade 6-12', 'Algorithms & Logic', 'T-03'],
        ['Dr. Meenakshi Sundaram', 'meenakshi.s@vidyasetu.org', 'teacher', 'SCH-003', 'Grade 9-12', 'Python & AI', 'T-04'],
        ['Mrs. Kavita Deshmukh', 'kavita.d@vidyasetu.org', 'teacher', 'SCH-004', 'Grade 6-10', 'Data Structures', 'T-05']
      ];
      for (const u of sampleUsers) {
        await client.query(`
          INSERT INTO users (name, email, role, school_id, grade, subject, roll_no)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, u);
      }
      console.log('Sample users seeded.');
    }

    // Seed Submissions if empty
    const subCount = await client.query('SELECT COUNT(*) FROM submissions');
    if (parseInt(subCount.rows[0].count) === 0) {
      console.log('Seeding initial code submissions...');
      const sampleSubs = [
        ['CODE-TASK-01', '1', 'Aarav Sharma', 'SCH-001', 'def fibonacci_series(n):\n    if n <= 0: return []\n    if n == 1: return [0]\n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[-1] + fib[-2])\n    return fib\n', 'passed', 100],
        ['CODE-TASK-02', '1', 'Aarav Sharma', 'SCH-001', 'def calculate_grade(marks):\n    if marks >= 90: return "A"\n    elif marks >= 75: return "B"\n    elif marks >= 50: return "C"\n    return "F"\n', 'passed', 100],
        ['CODE-TASK-01', '2', 'Pooja Kumari', 'SCH-001', 'def fibonacci_series(n):\n    # student code', 'passed', 95],
        ['CODE-TASK-02', '2', 'Pooja Kumari', 'SCH-001', 'def calculate_grade(marks):\n    # student code', 'passed', 90],
        ['CODE-TASK-01', '3', 'Rohan Verma', 'SCH-001', 'def fibonacci_series(n):\n    # student code', 'passed', 85],
        ['CODE-TASK-01', '4', 'Sneha Patel', 'SCH-001', 'def fibonacci_series(n):\n    # student code', 'passed', 100],
        ['CODE-TASK-02', '4', 'Sneha Patel', 'SCH-001', 'def calculate_grade(marks):\n    # student code', 'passed', 100],
        ['CODE-TASK-01', '5', 'Manoj Munda', 'SCH-002', 'def fibonacci_series(n):\n    # student code', 'passed', 95],
        ['CODE-TASK-02', '6', 'Sunita Yadav', 'SCH-002', 'def calculate_grade(marks):\n    # student code', 'passed', 80],
        ['CODE-TASK-01', '7', 'Riya Sen', 'SCH-003', 'def fibonacci_series(n):\n    # student code', 'passed', 100],
        ['CODE-TASK-01', '8', 'Karan Joshi', 'SCH-004', 'def fibonacci_series(n):\n    # student code', 'passed', 90],
        ['CODE-TASK-01', '9', 'Deepak Nayak', 'SCH-005', 'def fibonacci_series(n):\n    # student code', 'passed', 100],
        ['CODE-TASK-01', '10', 'Ananya Iyer', 'SCH-006', 'def fibonacci_series(n):\n    # student code', 'passed', 100]
      ];
      for (const s of sampleSubs) {
        await client.query(`
          INSERT INTO submissions (assignment_id, student_id, student_name, school_id, code, status, score)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, s);
      }
      console.log('Sample code submissions seeded.');
    }

  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
};
