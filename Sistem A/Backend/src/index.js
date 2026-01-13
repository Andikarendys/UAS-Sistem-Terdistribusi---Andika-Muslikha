import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import multer from 'multer'; 
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// --- 1. SETUP FOLDER UPLOADS ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

app.use(cors());
app.use(express.json());

// --- 2. KONFIGURASI MULTER ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });

// --- 3. DATABASE CONNECTION (POOL MODE) ---
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_gopay',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Cek koneksi awal
db.getConnection((err, conn) => {
    if (err) console.error('❌ DB GoPay Error:', err.code);
    else {
        console.log('✅ DB GoPay Terkoneksi (Pool Mode)');
        conn.release();
    }
});

// --- API ENDPOINTS ---

// 1. Cek Saldo & Profil
app.get('/api/saldo/:no_hp', (req, res) => {
    db.query("SELECT * FROM users WHERE no_hp = ?", [req.params.no_hp], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ message: "User not found" });
        res.json(result[0]);
    });
});

// 2. Upload Foto Profil
app.post('/api/upload-profil', upload.single('foto'), (req, res) => {
    const { no_hp } = req.body;
    const filename = req.file ? req.file.filename : null;
    if (!filename) return res.status(400).json({ message: "No file uploaded" });

    db.query("UPDATE users SET foto_profil = ? WHERE no_hp = ?", [filename, no_hp], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ status: 'sukses', message: 'Foto update', file: filename });
    });
});

// 3. Update Nama
app.post('/api/update-name', (req, res) => {
    const { no_hp, nama } = req.body;
    db.query("UPDATE users SET nama_user = ? WHERE no_hp = ?", [nama, no_hp], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ status: 'sukses', message: 'Nama update' });
    });
});

// 4. Statistik Grafik
app.get('/api/stats/:no_hp', (req, res) => {
    const sql = `
        SELECT DATE_FORMAT(waktu, '%Y-%m') as bulan, tipe_transaksi, SUM(nominal) as total
        FROM transaksi WHERE no_hp = ? GROUP BY bulan, tipe_transaksi ORDER BY bulan ASC LIMIT 6
    `;
    db.query(sql, [req.params.no_hp], (err, results) => {
        if (err) return res.status(500).json(err);
        const processed = {};
        results.forEach(row => {
            const bulanStr = new Date(row.bulan + '-01').toLocaleString('default', { month: 'short' });
            if (!processed[bulanStr]) processed[bulanStr] = { name: bulanStr, kredit: 0, debit: 0 };
            if (row.tipe_transaksi === 'kredit') processed[bulanStr].kredit = parseFloat(row.total);
            else processed[bulanStr].debit = parseFloat(row.total);
        });
        res.json(Object.values(processed));
    });
});

// 5. Login
app.post('/api/login', (req, res) => {
    const { no_hp, pin } = req.body;
    db.query("SELECT * FROM users WHERE no_hp = ? AND pin_security = ?", [no_hp, pin], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(401).json({ status: 'gagal', message: 'PIN Salah / Akun Tidak Ada' });
        res.json({ status: 'sukses', data: results[0] });
    });
});

// 6. Register
app.post('/api/register', (req, res) => {
    const { no_hp, nama, pin } = req.body;
    db.query("INSERT INTO users (no_hp, nama_user, pin_security, saldo) VALUES (?, ?, ?, 0)", [no_hp, nama, pin], (err) => {
        if (err && err.errno === 1062) return res.status(400).json({ message: "Nomor HP terdaftar" });
        if (err) return res.status(500).json(err);
        res.json({ status: 'sukses', message: 'Akun Terbuat' });
    });
});

// --- CORE TRANSACTION: FIX DATA INTEGRITY ---

// 7. Payment (Atomic Update)
app.post('/api/pay', (req, res) => {
    const { no_hp, pin, nominal, merchant } = req.body;
    console.log(`💸 [Sistem A] Request Bayar: ${no_hp}, Nominal: ${nominal}`);

    // QUERY KUNCI: Update hanya jika saldo cukup DAN pin benar
    // "saldo = saldo - ?" dilakukan langsung oleh database agar akurat
    const sql = `
        UPDATE users 
        SET saldo = saldo - ? 
        WHERE no_hp = ? AND pin_security = ? AND saldo >= ?
    `;

    db.query(sql, [nominal, no_hp, pin, nominal], (err, result) => {
        if (err) {
            console.error("❌ DB Error:", err);
            return res.status(500).json({ status: 'error', message: 'Database Error' });
        }

        // Jika affectedRows 0, berarti: PIN Salah ATAU Saldo Kurang ATAU User ga ada
        if (result.affectedRows === 0) {
            return res.status(400).json({ 
                status: 'gagal', 
                message: 'Transaksi Gagal: Cek PIN atau Saldo Anda' 
            });
        }

        // Jika berhasil update saldo, baru kita catat history
        const sqlHistory = "INSERT INTO transaksi (no_hp, merchant_name, tipe_transaksi, nominal, status) VALUES (?, ?, 'debit', ?, 'sukses')";
        
        db.query(sqlHistory, [no_hp, merchant, nominal], (errTrx, resTrx) => {
            if (errTrx) console.error("⚠️ Transaksi sukses tapi gagal catat history");

            // Ambil saldo terbaru buat ditampilkan ke user (opsional tapi bagus buat UX)
            db.query("SELECT saldo FROM users WHERE no_hp = ?", [no_hp], (errS, resS) => {
                const sisaSaldo = resS[0]?.saldo || 0;
                console.log(`✅ [Sistem A] Sukses. Sisa: ${sisaSaldo}`);
                
                res.json({
                    status: 'sukses',
                    message: 'Pembayaran Berhasil',
                    sisa_saldo: sisaSaldo,
                    trx_id: resTrx ? resTrx.insertId : null
                });
            });
        });
    });
});

// 8. Top Up (Atomic Update)
app.post('/api/topup', (req, res) => {
    const { no_hp, nominal } = req.body;

    // Langsung update di DB
    db.query("UPDATE users SET saldo = saldo + ? WHERE no_hp = ?", [nominal, no_hp], (err, result) => {
        if (err) return res.status(500).json({ message: "DB Error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

        // Catat History
        db.query("INSERT INTO transaksi (no_hp, merchant_name, tipe_transaksi, nominal, status) VALUES (?, 'Top Up', 'kredit', ?, 'sukses')", 
            [no_hp, nominal], 
            (errTrx) => {
                // Ambil saldo terbaru
                db.query("SELECT saldo FROM users WHERE no_hp = ?", [no_hp], (errS, resS) => {
                    res.json({ 
                        status: 'sukses', 
                        message: 'Top Up Berhasil',
                        saldo_baru: resS[0].saldo 
                    });
                });
            }
        );
    });
});

// 9. History
app.get('/api/history/:no_hp', (req, res) => {
    db.query("SELECT * FROM transaksi WHERE no_hp = ? ORDER BY waktu DESC LIMIT 20", [req.params.no_hp], (err, result) => res.json(result));
});

app.listen(PORT, () => console.log(`🚀 Sistem A (GoPay) Ready di Port ${PORT}`));