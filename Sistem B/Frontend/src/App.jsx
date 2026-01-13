import { useState, useEffect } from 'react';
import axios from 'axios';

const IconCheck = ({ size = 20, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconTimes = ({ size = 20, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconInfo = ({ size = 20, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const IconMusic = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
);

const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const IconPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);

const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

// ==========================================
// 2. MODAL & TOAST COMPONENTS
// ==========================================
function ConfirmModal({ isOpen, onClose, onConfirm, product, userBalance }) {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Konfirmasi Pembelian</h3>
          <button style={styles.modalClose} onClick={onClose}>×</button>
        </div>
        
        <div style={styles.modalBody}>
          <div style={styles.productPreview}>
             {/* TAMPILKAN GAMBAR ASLI */}
             {product.gambar ? (
                <img 
                  src={`/images/${product.gambar}`} 
                  alt={product.nama_barang} 
                  style={styles.previewImageReal}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }} 
                />
             ) : null}
             {/* Fallback jika gambar rusak/tidak ada */}
             <div style={{...styles.previewIcon, display: product.gambar ? 'none' : 'flex'}}>
                {product.nama_barang.substring(0, 2).toUpperCase()}
             </div>

            <div>
              <p style={styles.previewName}>{product.nama_barang}</p>
              <p style={styles.previewPrice}>Rp {parseInt(product.harga).toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div style={styles.paymentInfo}>
            <div style={styles.infoRow}>
              <span>Saldo GoPay</span>
              <span style={styles.currentBalance}>Rp {parseInt(userBalance).toLocaleString('id-ID')}</span>
            </div>
            <div style={styles.infoRow}>
              <span>Harga</span>
              <span style={styles.productCost}>- Rp {parseInt(product.harga).toLocaleString('id-ID')}</span>
            </div>
            <div style={{...styles.infoRow, ...styles.totalRow}}>
              <span>Sisa Saldo</span>
              <span style={styles.remainingBalance}>
                Rp {(parseInt(userBalance) - parseInt(product.harga)).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <p style={styles.modalWarning}>⚠️ Pembayaran diproses otomatis via GoPay</p>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.btnCancel} onClick={onClose}>Batal</button>
          <button style={styles.btnConfirm} onClick={onConfirm}>Bayar Sekarang</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ show, message, type, onClose }) {
  if (!show) return null;
  return (
    <div style={{
      ...styles.toast, 
      backgroundColor: type === 'success' ? '#00AA13' : type === 'error' ? '#fe2c55' : '#161823'
    }}>
      <span style={{marginRight:'10px', display:'flex', alignItems:'center'}}>
        {type === 'success' ? <IconCheck /> : type === 'error' ? <IconTimes /> : <IconInfo />}
      </span>
      <span style={styles.toastMessage}>{message}</span>
      <button style={styles.toastClose} onClick={onClose}>×</button>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div style={styles.skeletonCard}>
      <div style={styles.skeletonImage} />
      <div style={styles.skeletonContent}>
        <div style={{height: '20px', background: '#f0f0f0', marginBottom: '10px', borderRadius:'4px'}} />
        <div style={{height: '20px', background: '#f0f0f0', width: '60%', borderRadius:'4px'}} />
      </div>
    </div>
  );
}

// ==========================================
// 3. LOGIN PAGE
// ==========================================
function LoginPage({ onLoginSuccess, showToast }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [inputName, setInputName] = useState('');
  const [inputHp, setInputHp] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleAction = async () => {
    if (!inputHp || !inputPin) return showToast("Lengkapi data!", 'error');
    setLoading(true);
    try {
      const endpoint = isRegisterMode ? '/api/register' : '/api/login';
      const payload = isRegisterMode ? { no_hp: inputHp, nama: inputName, pin: inputPin } : { no_hp: inputHp, pin: inputPin };
      
      const res = await axios.post(`http://localhost:3001${endpoint}`, payload);

      if (isRegisterMode) {
        onLoginSuccess({ no_hp: inputHp, pin: inputPin, nama_user: inputName, saldo: 0 });
        showToast("Registrasi Berhasil!", 'success');
      } else {
        // Fix: Pastikan PIN ikut disimpan ke session agar bisa dipakai saat checkout
        onLoginSuccess({ ...(res.data.data || res.data), pin: inputPin });
        showToast("Login Berhasil!", 'success');
      }
    } catch (error) {
      showToast("Gagal Login/Register. Cek Backend.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginCard}>
        <div style={styles.loginHeader}>
          <div style={styles.logoCircle}>
             <IconMusic />
          </div>
          <h1 style={styles.logoTitle}>TikTok <span style={{color:'#fe2c55'}}>Shop</span></h1>
          <p style={{color:'#888', marginTop:'5px'}}>{isRegisterMode ? 'Daftar Akun Baru' : 'Login dengan GoPay'}</p>
        </div>
        
        <div style={styles.formGroup}>
          {isRegisterMode && (
             <div style={styles.inputWrapper}>
               <input 
                 style={{...styles.input, ...(focusedInput === 'name' ? styles.inputFocused : {})}} 
                 placeholder="Nama Lengkap" 
                 value={inputName} 
                 onChange={e=>setInputName(e.target.value)} 
                 onFocus={()=>setFocusedInput('name')} onBlur={()=>setFocusedInput(null)}
               />
               <span style={styles.inputIcon}><IconUser/></span>
             </div>
          )}
          <div style={styles.inputWrapper}>
            <input 
              style={{...styles.input, ...(focusedInput === 'hp' ? styles.inputFocused : {})}} 
              placeholder="Nomor HP GoPay" 
              value={inputHp} 
              onChange={e=>setInputHp(e.target.value)} 
              onFocus={()=>setFocusedInput('hp')} onBlur={()=>setFocusedInput(null)}
            />
            <span style={styles.inputIcon}><IconPhone/></span>
          </div>
          <div style={styles.inputWrapper}>
            <input 
              style={{...styles.input, ...(focusedInput === 'pin' ? styles.inputFocused : {})}} 
              type="password" 
              placeholder="PIN (6 Digit)" 
              value={inputPin} 
              onChange={e=>setInputPin(e.target.value)} 
              maxLength={6} 
              onFocus={()=>setFocusedInput('pin')} onBlur={()=>setFocusedInput(null)}
            />
            <span style={styles.inputIcon}><IconLock/></span>
          </div>
        </div>
        
        <button onClick={handleAction} disabled={loading} style={styles.btnPrimary}>
          {loading ? '...' : (isRegisterMode ? 'Daftar' : 'Masuk')}
        </button>
        <p style={{marginTop:'20px', color:'#fe2c55', cursor:'pointer', fontSize:'0.9rem', fontWeight:'600'}} onClick={() => setIsRegisterMode(!isRegisterMode)}>
          {isRegisterMode ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 4. HOME PAGE (FULL WIDTH DASHBOARD)
// ==========================================
function HomePage({ userSession, onLogout, showToast, updateBalance }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ open: false, product: null });
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/products');
      setProducts(res.data);
    } catch (err) {
      showToast("Gagal load produk", 'error');
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleBuyClick = (product) => {
    if (product.stok <= 0) return;
    if (parseFloat(userSession.saldo) < parseFloat(product.harga)) {
      return showToast("Saldo GoPay Kurang!", 'error');
    }
    setConfirmModal({ open: true, product });
  };

  const handleConfirmBuy = async () => {
    const product = confirmModal.product;
    setConfirmModal({ open: false, product: null });
    
    try {
      const res = await axios.post('http://localhost:3001/api/checkout', {
        no_hp: userSession.no_hp,
        pin: userSession.pin,
        id_produk: product.id_produk
      });

      if (res.data.data_payment?.sisa_saldo !== undefined) {
        updateBalance(res.data.data_payment.sisa_saldo);
      }
      showToast('Pembayaran Berhasil!', 'success');
      loadProducts(); 
    } catch (err) {
      showToast("Transaksi Gagal", 'error');
    }
  };

  const flashSaleProducts = products.filter(p => p.kategori === 'flash_sale');
  const normalProducts = products.filter(p => p.kategori === 'normal' || !p.kategori);

  // --- REUSABLE PRODUCT CARD ---
  const ProductCard = ({ item, isFlashSale }) => (
    <div 
      key={item.id_produk} 
      style={{
        ...styles.productCard,
        ...(hoveredCard === item.id_produk ? styles.productCardHover : {})
      }}
      onMouseEnter={() => setHoveredCard(item.id_produk)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      {isFlashSale && <div style={styles.flashBadge}>⚡ DISKON</div>}
      {item.stok <= 5 && item.stok > 0 && <div style={styles.lowStockBadge}>Sisa {item.stok}</div>}
      
      {/* UPDATE: MENAMPILKAN GAMBAR PRODUK DI HOME */}
      <div style={styles.productImageContainer}>
        {item.gambar ? (
           <img 
             src={`/images/${item.gambar}`} 
             alt={item.nama_barang} 
             style={styles.productImageReal}
             onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
             }}
           />
        ) : null}
        {/* Fallback Placeholder */}
        <div style={{...styles.productImagePlaceholder, display: item.gambar ? 'none' : 'flex'}}>
          <span style={styles.productImageText}>
            {item.nama_barang.substring(0, 2).toUpperCase()}
          </span>
        </div>
      </div>
      
      <div style={styles.productInfo}>
        <h4 style={styles.productTitle}>{item.nama_barang}</h4>
        <div style={styles.productPrice}>Rp {parseInt(item.harga).toLocaleString('id-ID')}</div>
        <div style={styles.productStock}>Stok: {item.stok}</div>
        
        <button 
          onClick={() => handleBuyClick(item)}
          disabled={item.stok <= 0}
          style={item.stok > 0 ? styles.btnBuy : styles.btnOutOfStock}
        >
          {item.stok > 0 ? 'Beli Sekarang' : 'Habis'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.homeContainer}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.logoGroup}>
             <div style={styles.navLogoIcon}><IconMusic /></div>
             <span style={styles.logoText}>TikTok <span style={{color:'#fe2c55'}}>Shop</span></span>
          </div>
          
          <div style={styles.navCenter}>
             <div style={styles.searchBar}>
                <span style={{marginRight:'10px', display:'flex'}}><IconSearch/></span>
                <input placeholder="Cari barang..." style={styles.searchInput} />
             </div>
          </div>

          <div style={styles.navRight}>
            <div style={styles.balanceWidget}>
               <small style={{color:'#888', fontSize:'0.7rem'}}>Saldo GoPay</small>
               <div style={{color:'#00AA13', fontWeight:'800', fontSize:'1rem'}}>
                  Rp {parseInt(userSession.saldo).toLocaleString('id-ID')}
               </div>
            </div>
            <div style={styles.profileSection}>
              <span style={{fontWeight:'600'}}>{userSession.nama_user}</span>
              <button onClick={onLogout} style={styles.btnLogout}>
                 Keluar
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO BANNER - FULL WIDTH */}
      <div style={styles.heroBanner}>
        <div style={styles.heroContent}>
           <div style={styles.heroBadgePill}>🔥 12.12 MEGA SALE</div>
           <h2 style={styles.heroTitle}>Diskon Hingga 50%</h2>
           <p style={styles.heroDesc}>Khusus pembayaran menggunakan GoPay. Promo terbatas!</p>
           <button style={styles.heroCTA}>Cek Promo</button>
        </div>
      </div>

      <main style={styles.mainContent}>
        
        {/* SECTION 1: FLASH SALE */}
        <div style={styles.sectionContainer}>
           <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>⚡ Flash Sale</h3>
              <span style={styles.seeAll}>Lihat Semua</span>
           </div>
           <div style={styles.productGrid}>
             {loading ? Array.from({length:5}).map((_,i)=><ProductSkeleton key={i}/>) : 
               flashSaleProducts.map(item => <ProductCard key={item.id_produk} item={item} isFlashSale={true} />)
             }
           </div>
        </div>

        {/* SECTION 2: REKOMENDASI */}
        <div style={styles.sectionContainer}>
           <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>✨ Rekomendasi Untukmu</h3>
           </div>
           <div style={styles.productGrid}>
             {loading ? Array.from({length:5}).map((_,i)=><ProductSkeleton key={i+5}/>) : 
               normalProducts.map(item => <ProductCard key={item.id_produk} item={item} isFlashSale={false} />)
             }
           </div>
        </div>

      </main>

      <ConfirmModal 
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, product: null })}
        onConfirm={handleConfirmBuy}
        product={confirmModal.product}
        userBalance={userSession.saldo}
      />
    </div>
  );
}

// --- MAIN APP ---
function App() {
  const [userSession, setUserSession] = useState(null); 
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  useEffect(() => {
    // FORCE FULL WIDTH & STYLE RESET
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.width = "100%";
    document.body.style.fontFamily = "'Inter', -apple-system, sans-serif";
    document.body.style.backgroundColor = "#f8f8f8";
    
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      #root { max-width: none !important; width: 100% !important; margin: 0 !important; }
      body { display: block !important; overflow-x: hidden; }
      * { box-sizing: border-box; }
    `;
    document.head.appendChild(styleTag);

    try {
      const savedUser = localStorage.getItem('tiktok_user');
      if (savedUser) setUserSession(JSON.parse(savedUser));
    } catch (e) { localStorage.removeItem('tiktok_user'); }
  }, []);

  const handleUpdateBalance = (newBalance) => {
    const updatedUser = { ...userSession, saldo: newBalance };
    setUserSession(updatedUser);
    localStorage.setItem('tiktok_user', JSON.stringify(updatedUser));
  };

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false }), 3000);
  };

  return (
    <>
      {!userSession ? (
        <LoginPage onLoginSuccess={(u) => {setUserSession(u); localStorage.setItem('tiktok_user', JSON.stringify(u));}} showToast={showToast} />
      ) : (
        <HomePage 
          userSession={userSession} 
          onLogout={() => {setUserSession(null); localStorage.removeItem('tiktok_user');}} 
          showToast={showToast} 
          updateBalance={handleUpdateBalance} 
        />
      )}
      <Toast show={toast.show} message={toast.msg} type={toast.type} onClose={()=>setToast({show:false})} />
    </>
  );
}

// --- STYLES ---
const styles = {
  // Login
  loginContainer: { minHeight:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'linear-gradient(135deg, #eee, #fff)', width: '100%' },
  loginCard: { background:'white', padding:'40px', borderRadius:'16px', boxShadow:'0 10px 40px rgba(0,0,0,0.1)', textAlign:'center', width:'100%', maxWidth:'380px' },
  logoCircle: { width:'60px', height:'60px', background:'black', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 15px', boxShadow:'3px 3px 0 #00f2ea' },
  logoTitle: { fontSize:'2rem', fontWeight:'800', margin:'0 0 5px 0', letterSpacing:'-1px' },
  
  // FORM INPUT STYLES
  formGroup: { display:'flex', flexDirection:'column', gap:'15px', marginBottom:'25px', marginTop:'30px' },
  inputWrapper: { position: 'relative' },
  input: { 
    width:'100%', padding:'14px 14px 14px 45px', // Padding kiri untuk icon
    border:'1px solid #ddd', borderRadius:'8px', fontSize:'1rem', outline:'none', 
    background:'#f9f9f9', transition:'border 0.2s', 
    color: '#333' // WAJIB HITAM BIAR KELIHATAN
  },
  inputFocused: { borderColor: '#fe2c55', background: '#fff' },
  inputIcon: { position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', zIndex: 1 },

  btnPrimary: { width:'100%', padding:'14px', background:'#fe2c55', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', fontSize:'1rem', boxShadow:'0 4px 15px rgba(254,44,85,0.3)' },

  // Home
  homeContainer: { minHeight:'100vh', display:'flex', flexDirection:'column', width:'100%' },
  navbar: { background:'white', height:'72px', display:'flex', alignItems:'center', position:'sticky', top:0, zIndex:100, borderBottom:'1px solid #eee' },
  navContainer: { width:'100%', padding:'0 40px', display:'flex', justifyContent:'space-between', alignItems:'center', boxSizing:'border-box' },
  logoGroup: { display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' },
  navLogoIcon: { width:'36px', height:'36px', background:'black', color:'#00f2ea', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'2px 2px 0 #fe2c55' },
  logoText: { fontSize:'1.5rem', fontWeight:'800', letterSpacing:'-0.5px' },
  
  navCenter: { flex:1, maxWidth:'600px', margin:'0 40px' },
  searchBar: { background:'#f1f2f3', borderRadius:'99px', padding:'10px 20px', display:'flex', alignItems:'center' },
  searchInput: { border:'none', background:'transparent', outline:'none', width:'100%', marginLeft:'10px', fontSize:'0.95rem' },

  navRight: { display:'flex', alignItems:'center', gap:'25px' },
  balanceWidget: { textAlign:'right', borderRight:'1px solid #eee', paddingRight:'20px' },
  profileSection: { display:'flex', alignItems:'center', gap:'15px' },
  btnLogout: { background:'#f0f0f0', border:'none', padding:'8px 12px', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center' },

  heroBanner: { background:'linear-gradient(90deg, #111, #222)', color:'white', padding:'60px 40px', textAlign:'center', width:'100%', boxSizing:'border-box' },
  heroContent: { maxWidth:'900px', margin:'0 auto' },
  heroBadgePill: { background:'#fe2c55', display:'inline-block', padding:'6px 16px', borderRadius:'99px', fontSize:'0.85rem', fontWeight:'bold', marginBottom:'15px', boxShadow:'0 0 15px rgba(254,44,85,0.5)' },
  heroTitle: { fontSize:'3.5rem', margin:'0 0 10px 0', fontWeight:'900', lineHeight:'1.1' },
  heroDesc: { fontSize:'1.2rem', color:'#ccc', marginBottom:'30px' },
  heroCTA: { padding:'14px 35px', background:'white', color:'black', border:'none', borderRadius:'99px', fontWeight:'bold', fontSize:'1rem', cursor:'pointer' },

  mainContent: { width:'100%', padding:'40px 40px 80px 40px' },
  sectionContainer: { marginBottom:'50px' },
  sectionHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px' },
  sectionTitle: { fontSize:'1.8rem', fontWeight:'800', margin:0, color:'#161823' },
  seeAll: { color:'#fe2c55', fontWeight:'700', cursor:'pointer', fontSize:'0.95rem' },
  
  productGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'30px' },
  
  productCard: { background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 5px 20px rgba(0,0,0,0.03)', position:'relative', transition:'all 0.3s', border:'1px solid #f0f0f0' },
  productCardHover: { transform:'translateY(-8px)', boxShadow:'0 15px 30px rgba(0,0,0,0.08)' },
  
  flashBadge: { position:'absolute', top:'12px', left:'12px', background:'#fe2c55', color:'white', padding:'4px 10px', borderRadius:'6px', fontSize:'0.75rem', fontWeight:'bold', zIndex:2, display:'flex', alignItems:'center', gap:'4px' },
  lowStockBadge: { position:'absolute', top:'12px', right:'12px', background:'rgba(0,0,0,0.7)', color:'white', padding:'4px 10px', borderRadius:'6px', fontSize:'0.75rem', zIndex:2 },
  
  productImageContainer: { height:'260px', width:'100%', background:'#f7f7f7', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' },
  productImageReal: { width:'100%', height:'100%', objectFit:'cover' },
  productImagePlaceholder: { width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#ddd', fontSize:'3rem', fontWeight:'900' },
  productImageText: { fontSize: '3rem', fontWeight: '900', color: '#ccc' },

  productInfo: { padding:'20px' },
  productTitle: { fontSize:'1.1rem', fontWeight:'700', margin:'0 0 8px 0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'#161823' },
  productPrice: { color:'#fe2c55', fontWeight:'800', fontSize:'1.3rem', marginBottom:'5px' },
  productStock: { fontSize:'0.85rem', color:'#888', marginBottom:'15px' },
  
  btnBuy: { width:'100%', padding:'12px', background:'#161823', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem' },
  btnOutOfStock: { width:'100%', padding:'12px', background:'#f0f0f0', color:'#aaa', border:'none', borderRadius:'10px', cursor:'not-allowed', fontWeight:'bold' },

  // Modal
  modalOverlay: { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', backdropFilter:'blur(5px)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000 },
  modalContent: { background:'white', padding:'30px', borderRadius:'24px', width:'90%', maxWidth:'450px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px' },
  modalTitle: { margin:0, fontSize:'1.4rem', fontWeight:'800' },
  modalClose: { background:'none', border:'none', fontSize:'1.8rem', cursor:'pointer', color:'#888', padding:0, lineHeight:1 },
  
  productPreview: { display:'flex', gap:'20px', marginBottom:'25px', background:'#f9f9f9', padding:'15px', borderRadius:'16px' },
  previewImageReal: { width:'60px', height:'60px', borderRadius:'10px', objectFit:'cover' },
  previewIcon: { width:'60px', height:'60px', background:'white', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', border:'1px solid #eee', fontSize:'1.2rem', color:'#fe2c55' },
  previewName: { margin:'0 0 5px 0', fontWeight:'700', fontSize:'1.1rem' },
  previewPrice: { margin:0, color:'#666', fontSize:'1rem' },
  
  paymentInfo: { marginBottom:'25px' },
  infoRow: { display:'flex', justifyContent:'space-between', marginBottom:'12px', fontSize:'1rem' },
  currentBalance: { fontWeight:'600' },
  productCost: { color:'#fe2c55', fontWeight:'600' },
  totalRow: { borderTop:'2px dashed #eee', paddingTop:'15px', marginTop:'15px', fontWeight:'800', fontSize:'1.1rem' },
  remainingBalance: { color:'#00AA13' },
  modalWarning: { fontSize:'0.9rem', background:'#fff8e1', padding:'12px', borderRadius:'8px', color:'#f57c00', display:'flex', alignItems:'center', gap:'8px' },
  warningIcon: { fontSize:'1.2rem' },
  
  modalFooter: { display:'flex', gap:'15px', marginTop:'30px' },
  btnCancel: { flex:1, padding:'14px', border:'1px solid #ddd', background:'white', borderRadius:'12px', cursor:'pointer', fontWeight:'600', fontSize:'1rem' },
  btnConfirm: { flex:1, padding:'14px', background:'#fe2c55', color:'white', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem', boxShadow:'0 5px 20px rgba(254,44,85,0.3)' },

  // Toast
  toast: { position:'fixed', bottom:'40px', right:'40px', padding:'16px 24px', borderRadius:'12px', color:'white', display:'flex', alignItems:'center', gap:'12px', zIndex:9999, boxShadow:'0 10px 40px rgba(0,0,0,0.2)' },
  toastMessage: { fontWeight:'600', fontSize:'0.95rem' },
  toastClose: { background:'none', border:'none', color:'white', marginLeft:'auto', cursor:'pointer', fontSize:'1.2rem' },
  
  // Skeleton
  skeletonCard: { background:'white', borderRadius:'16px', height:'380px', border:'1px solid #f0f0f0' },
  skeletonImage: { height:'260px', background:'#f0f0f0' },
  skeletonContent: { padding:'20px' }
};

export default App;