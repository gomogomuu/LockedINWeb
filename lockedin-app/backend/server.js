// backend/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Konfigurasi Database Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test Koneksi DB saat Server Menyala
pool.connect((err, client, release) => {
  if (err) {
    return console.error('[LockedIn DB] Gagal terhubung ke database:', err.stack);
  }
  console.log('[LockedIn DB] Koneksi database PostgreSQL berhasil!');
  release();
});

// Middleware
app.use(cors());
app.use(express.json());

// ==================== ENDPOINT API ====================

// 1. Endpoint Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: "success", message: "API & DB LockedIn terkoneksi!" });
});

// 2. Endpoint Mengambil Data Jadwal Kalender (Sesuai Gambar UI Kalender)
app.get('/api/calendar/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const queryText = `
            SELECT t.task_id, t.title, t.start_time, t.end_time, g.group_name, m.is_afk
            FROM thread_tasks t
            JOIN groups g ON t.group_id = g.group_id
            JOIN group_members m ON g.group_id = m.group_id
            WHERE t.assigned_to = $1 OR m.user_id = $1
            ORDER BY t.start_time ASC;
        `;
        const result = await pool.query(queryText, [userId]);
        res.json({ status: "success", data: result.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: "error", message: "Gagal mengambil data kalender" });
    }
});

app.listen(PORT, () => {
    console.log(`[LockedIn API] Server running on port ${PORT}`);
});