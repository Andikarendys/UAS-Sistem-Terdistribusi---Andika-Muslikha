import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import axios from 'axios'; 

const app = express();
const PORT = 3001; 

app.use(cors());
app.use(express.json());

// --- KONEKSI DATABASE (POOL MODE) ---
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'db_tiktok_shop',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Cek koneksi
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ FATAL: Gagal konek ke Database TikTok Shop');
        console.error('   Penyebab:', err.code);
    } else {
        console.log('✅ Terkoneksi ke Database TikTok Shop (Pool Active)');
        connection.release();
    }
});

// --- API ENDPOINTS ---

// 1. GET PRODUK
app.get('/api/products', (req, res) => {
    db.query("SELECT * FROM produk", (err, result) => {
        if (err) {
            console.error("Error ambil produk:", err);
            return res.status(500).json({ message: "Gagal ambil data produk" });
        }
        res.json(result);
    });
});

// 2. LOGIN BRIDGE (Proxy ke Sistem A)
app.post('/api/login', async (req, res) => {
    const { no_hp, pin } = req.body;
    try {
        console.log(`📡 [Proxy Login] Meneruskan ${no_hp} ke GoPay...`);
        // Tembak ke Backend A
        const responseGoPay = await axios.post('http://localhost:3000/api/login', { no_hp, pin });
        res.json(responseGoPay.data);
    } catch (error) {
        const msg = error.response ? error.response.data.message : "Sistem Pembayaran (GoPay) Offline";
        console.error(`❌ Login Gagal: ${msg}`);
        res.status(401).json({ message: msg });
    }
});

// 3. REGISTER BRIDGE
app.post('/api/register', async (req, res) => {
    const { no_hp, nama, pin } = req.body;
    try {
        // 1. Daftar dulu di GoPay (Master Data)
        await axios.post('http://localhost:3000/api/register', { no_hp, nama, pin });
        
        // 2. Simpan copy data user di TikTok Shop (Optional, buat history lokal)
        db.query("INSERT IGNORE INTO users (no_hp, nama_user) VALUES (?, ?)", [no_hp, nama]);
        
        res.json({ status: 'sukses', message: 'Registrasi Berhasil di GoPay & TikTok Shop.' });
    } catch (error) {
        const msg = error.response ? error.response.data.message : "Gagal Register ke Sistem A";
        res.status(400).json({ message: msg });
    }
});

// 4. CHECKOUT (LOGIKA: RESERVE STOCK -> PAY -> CONFIRM/ROLLBACK)
app.post('/api/checkout', async (req, res) => {
    const { no_hp, pin, id_produk } = req.body;
    const idOrder = `ORD-${Date.now()}`; // ID Order Unik

    console.log(`🛒 [Checkout Start] HP: ${no_hp}, Produk: ${id_produk}`);

    // --- LANGKAH 1: AMBIL HARGA DULU ---
    db.query("SELECT harga FROM produk WHERE id_produk = ?", [id_produk], (err, resProduk) => {
        if (err || resProduk.length === 0) return res.status(404).json({ message: "Produk tidak valid" });
        
        const totalBayar = resProduk[0].harga;

        // --- LANGKAH 2: ATOMIC STOCK RESERVATION (PENTING!) ---
        // Kita kurangi stok langsung. Kalau stok 0, query ini gagal (affectedRows = 0).
        // Ini mencegah 'overselling' (barang minus).
        db.query("UPDATE produk SET stok = stok - 1 WHERE id_produk = ? AND stok > 0", [id_produk], (errUpdate, resUpdate) => {
            
            if (errUpdate) return res.status(500).json({ message: "DB Error saat update stok" });
            
            // Kalau tidak ada baris yang terupdate, berarti STOK HABIS
            if (resUpdate.affectedRows === 0) {
                console.warn("⚠️ Stok Habis, transaksi dibatalkan.");
                return res.status(400).json({ message: "Stok Habis! Transaksi Dibatalkan." });
            }

            // --- LANGKAH 3: BUAT ORDER PENDING ---
            // Stok sudah berkurang, sekarang buat order status 'menunggu_bayar'
            const sqlOrder = "INSERT INTO pesanan (id_order, no_hp_pembeli, id_produk, total_bayar, status_pembayaran) VALUES (?, ?, ?, ?, 'menunggu_bayar')";
            
            db.query(sqlOrder, [idOrder, no_hp, id_produk, totalBayar], async (errInsert) => {
                if (errInsert) {
                    // CRITICAL: Kalau gagal buat order, BALIKIN STOKNYA
                    db.query("UPDATE produk SET stok = stok + 1 WHERE id_produk = ?", [id_produk]);
                    return res.status(500).json({ message: "Gagal membuat order." });
                }

                // --- LANGKAH 4: MINTA BAYAR KE SISTEM A (GoPay) ---
                try {
                    console.log(`💸 Menghubungi GoPay untuk tagihan Rp ${totalBayar}...`);
                    
                    const responseGoPay = await axios.post('http://localhost:3000/api/pay', {
                        no_hp: no_hp,
                        pin: pin,
                        nominal: totalBayar,
                        merchant: 'TikTok Shop Official'
                    });

                    // --- LANGKAH 5A: PEMBAYARAN SUKSES ---
                    if (responseGoPay.data.status === 'sukses') {
                        db.query("UPDATE pesanan SET status_pembayaran = 'lunas' WHERE id_order = ?", [idOrder]);
                        console.log("✅ Transaksi LUNAS & Selesai.");
                        
                        return res.json({
                            status: 'berhasil',
                            message: 'Pembayaran Sukses!',
                            data_payment: responseGoPay.data
                        });
                    }

                } catch (error) {
                    // --- LANGKAH 5B: PEMBAYARAN GAGAL (ROLLBACK) ---
                    // Karena bayar gagal/koneksi putus, kita harus batalkan order DAN KEMBALIKAN STOK
                    
                    const errorMsg = error.response ? error.response.data.message : "Koneksi Pembayaran Gagal";
                    console.error("❌ Pembayaran Gagal:", errorMsg);

                    // 1. Update status pesanan jadi batal
                    db.query("UPDATE pesanan SET status_pembayaran = 'batal' WHERE id_order = ?", [idOrder]);
                    
                    // 2. REFUND STOK (Kembalikan stok yang tadi sudah di-booking)
                    db.query("UPDATE produk SET stok = stok + 1 WHERE id_produk = ?", [id_produk]);
                    console.log("🔄 Stok dikembalikan karena pembayaran gagal.");

                    return res.status(400).json({
                        status: 'gagal',
                        message: `Pembayaran Gagal: ${errorMsg}`
                    });
                }
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`🛍️  Sistem B (TikTok Shop) Ready di Port ${PORT}`);
});