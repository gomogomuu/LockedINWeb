-- 1. TABEL USERS (Menggunakan format Unique Tag ala Discord)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    user_tag VARCHAR(4) NOT NULL, -- Contoh: '0001'
    email VARCHAR(100) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_identity UNIQUE (username, user_tag)
);

-- 2. TABEL GROUPS (Kelompok Project)
CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(10) UNIQUE NOT NULL, -- Kode instan masuk kelompok
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL GROUP_MEMBERS (Relasi Many-to-Many antara User & Kelompok)
CREATE TABLE group_members (
    group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'admin' (ketua) atau 'member'
    is_afk BOOLEAN DEFAULT FALSE,     -- Otomatisasi fitur Anti-AFK Tracking
    PRIMARY KEY (group_id, user_id)
);

-- 4. TABEL THREAD_TASKS (Struktur Kalender & Konteks Diskusi Kelompok)
CREATE TABLE thread_tasks (
    task_id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
    assigned_to INT REFERENCES users(user_id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,    -- Untuk data pemetaan di Kalender
    end_time TIMESTAMP NOT NULL,      -- Untuk batasan deadline Kalender
    progress_percentage INT DEFAULT 0, -- Progress real-time sub-tugas
    status VARCHAR(20) DEFAULT 'pending' -- 'pending', 'ongoing', 'completed'
);