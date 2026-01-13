import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'; 

// --- SVG ICONS COMPONENTS ---
const IconWallet = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
);
const IconUser = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const IconPhone = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
const IconLock = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const IconLogOut = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
const IconCamera = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
);
const IconPen = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
const IconBolt = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const IconChart = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
);
const IconHistory = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const IconCheck = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const IconTimes = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

// --- TOAST ---
function Toast({ show, message, type, onClose }) {
  if (!show) return null;
  return (
    <div style={{
      ...styles.toast,
      backgroundColor: type === 'success' ? '#00AA13' : type === 'error' ? '#DC3545' : '#1A1A1A'
    }}>
      <span style={{ marginRight: '8px' }}>
        {type === 'success' ? <IconCheck size={18} color="white"/> : <IconTimes size={18} color="white"/>}
      </span>
      <span style={styles.toastMessage}>{message}</span>
      <button style={styles.toastClose} onClick={onClose}>×</button>
    </div>
  );
}

// --- LOGIN PAGE ---
function LoginPage({ onLoginSuccess, showToast }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [inputName, setInputName] = useState('');
  const [inputHp, setInputHp] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!inputHp || !inputPin) return showToast("Lengkapi data!", 'error');
    setLoading(true);
    try {
      const endpoint = isRegisterMode ? '/api/register' : '/api/login';
      const payload = isRegisterMode 
        ? { no_hp: inputHp, nama: inputName, pin: inputPin }
        : { no_hp: inputHp, pin: inputPin };

      const res = await axios.post(`http://localhost:3000${endpoint}`, payload);

      if (isRegisterMode) {
        onLoginSuccess({ no_hp: inputHp, pin: inputPin, nama_user: inputName, saldo: 0 });
        showToast("Registrasi Berhasil!", 'success');
      } else {
        onLoginSuccess(res.data.data); 
        showToast("Login Berhasil!", 'success');
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Koneksi Gagal", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.patternOverlay}></div>
      <div style={styles.loginCard}>
        <div style={styles.loginHeader}>
          <div style={styles.loginLogoWrapper}>
             <img 
               src="/images/Gopay.jpg" 
               alt="GoPay" 
               style={styles.logoImageLarge}
               onError={(e) => e.target.style.display = 'none'} 
             />
          </div>
          <h1 style={styles.logoTitle}>GoPay <span style={{color:'#00AA13', fontWeight:'400'}}>Wallet</span></h1>
          <p style={{color:'#666666', fontSize: '0.875rem', marginTop: '8px'}}>
            {isRegisterMode ? 'Buat Akun Baru' : 'Secure Login'}
          </p>
        </div>
        
        <div style={styles.formGroup}>
          {isRegisterMode && (
            <div style={styles.inputWrapper}>
              <input 
                style={styles.input} 
                placeholder="Nama Lengkap" 
                value={inputName} 
                onChange={e=>setInputName(e.target.value)} 
              />
              <div style={styles.inputIcon}><IconUser size={18} color="#666666" /></div>
            </div>
          )}
          <div style={styles.inputWrapper}>
            <input 
              style={styles.input} 
              placeholder="Nomor HP" 
              value={inputHp} 
              onChange={e=>setInputHp(e.target.value)} 
            />
            <div style={styles.inputIcon}><IconPhone size={18} color="#666666" /></div>
          </div>
          <div style={styles.inputWrapper}>
            <input 
              style={styles.input} 
              type="password" 
              placeholder="PIN (6 Digit)" 
              value={inputPin} 
              onChange={e=>setInputPin(e.target.value)} 
              maxLength={6} 
            />
            <div style={styles.inputIcon}><IconLock size={18} color="#666666" /></div>
          </div>
        </div>
        
        <button onClick={handleAction} disabled={loading} style={styles.btnPrimary}>
          {loading ? 'Memproses...' : (isRegisterMode ? 'Daftar' : 'Masuk')}
        </button>
        <p style={styles.toggleContainer}>
          {isRegisterMode ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <span style={styles.linkText} onClick={() => setIsRegisterMode(!isRegisterMode)}>
            {isRegisterMode ? 'Login disini' : 'Daftar disini'}
          </span>
        </p>
      </div>
    </div>
  );
}

// --- DASHBOARD ---
function Dashboard({ userSession, onLogout, showToast, refreshTrigger, onUpdateUser }) {
  const [history, setHistory] = useState([]);
  const [statsData, setStatsData] = useState([]);
  const [nominalTopUp, setNominalTopUp] = useState('');
  const [userData, setUserData] = useState(userSession);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(userSession.nama_user);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
    setUserData(userSession);
    setEditNameValue(userSession.nama_user);
  }, [refreshTrigger, userSession]);

  const fetchData = async () => {
    try {
      const resUser = await axios.get(`http://localhost:3000/api/saldo/${userSession.no_hp}`);
      setUserData(resUser.data);
      const resHist = await axios.get(`http://localhost:3000/api/history/${userSession.no_hp}`);
      setHistory(resHist.data);
      const resStats = await axios.get(`http://localhost:3000/api/stats/${userSession.no_hp}`);
      setStatsData(resStats.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTopUp = async () => {
    if (!nominalTopUp || nominalTopUp < 10000) return showToast("Min. Top Up 10.000", 'error');
    try {
      await axios.post('http://localhost:3000/api/topup', { no_hp: userSession.no_hp, nominal: nominalTopUp });
      showToast("Top Up Berhasil!", 'success');
      setNominalTopUp('');
      fetchData();
    } catch (e) { showToast("Top Up Gagal", 'error'); }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);
    formData.append('no_hp', userSession.no_hp);

    try {
      await axios.post('http://localhost:3000/api/upload-profil', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast("Foto Profil Diupdate!", 'success');
      fetchData(); 
    } catch (err) {
      showToast("Gagal Upload Foto", 'error');
    }
  };

  const handleSaveName = async () => {
    if (!editNameValue.trim()) return showToast("Nama tidak boleh kosong", 'error');
    try {
      await axios.post('http://localhost:3000/api/update-name', {
        no_hp: userSession.no_hp,
        nama: editNameValue
      });
      const updatedUser = { ...userData, nama_user: editNameValue };
      setUserData(updatedUser);
      onUpdateUser(updatedUser); 
      setIsEditingName(false);
      showToast("Nama berhasil diubah!", 'success');
    } catch (error) {
      const updatedUser = { ...userData, nama_user: editNameValue };
      setUserData(updatedUser);
      onUpdateUser(updatedUser);
      setIsEditingName(false);
      showToast("Nama diubah (Lokal)", 'success');
    }
  };

  const avatarUrl = userData.foto_profil 
    ? `http://localhost:3000/uploads/${userData.foto_profil}`
    : null;

  return (
    <div style={styles.homeContainer}>
      <div style={styles.patternOverlayDashboard}></div>
      
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.logoGroup}>
            <img 
               src="/images/Gopay.jpg" 
               alt="GoPay" 
               style={styles.logoImageNavbar}
               onError={(e) => e.target.style.display = 'none'} 
             />
            <span style={styles.logoText}>GoPay <span style={{fontWeight:'400', color:'#666666'}}>Wallet</span></span>
          </div>
          
          <div style={styles.navRight}>
            <div style={styles.profileSection}>
              <div style={styles.avatarWrapper} onClick={() => fileInputRef.current.click()} title="Ganti Foto">
                {avatarUrl ? (
                  <img src={avatarUrl} style={styles.avatarImg} alt="Profil" onError={(e) => e.target.style.display='none'} />
                ) : (
                  <div style={styles.avatarPlaceholder}>{userData.nama_user.charAt(0).toUpperCase()}</div>
                )}
                <div style={styles.cameraIcon}><IconCamera size={10} color="white"/></div>
                <input type="file" ref={fileInputRef} style={{display:'none'}} accept="image/*" onChange={handleFileChange} />
              </div>

              <div style={styles.nameWrapper}>
                {isEditingName ? (
                  <div style={styles.editNameGroup}>
                    <input 
                      style={styles.inputNameEdit} 
                      value={editNameValue} 
                      onChange={(e) => setEditNameValue(e.target.value)}
                      autoFocus
                    />
                    <button onClick={handleSaveName} style={styles.btnIconSave} title="Simpan">Simpan</button>
                    <button onClick={() => setIsEditingName(false)} style={styles.btnIconCancel} title="Batal">Batal</button>
                  </div>
                ) : (
                  <div style={styles.displayNameGroup}>
                    <span style={styles.profileName}>{userData.nama_user}</span>
                    <button onClick={() => setIsEditingName(true)} style={styles.btnEditName} title="Ubah Nama">
                      <IconPen size={12} color="#666666" />
                    </button>
                  </div>
                )}
              </div>

              <button style={styles.btnLogoutRed} onClick={onLogout}>
                Keluar <IconLogOut size={14} color="white" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main style={styles.mainContent}>
        {/* ROW 1: SALDO & TOP UP */}
        <div style={styles.topSection}>
          <div style={styles.cardContainer}>
            <h3 style={styles.sectionTitleWhite}>
              <IconWallet size={20} color="white" /> Sisa Saldo
            </h3>
            <div style={styles.balanceCard}>
              <div style={styles.cardPattern}></div>
              <div style={{position:'relative', zIndex:2}}>
                <p style={{opacity:0.85, fontSize:'0.875rem', fontWeight: '500', marginBottom: '4px'}}>Active Balance</p>
                <h1 style={styles.balanceBig}>Rp {parseInt(userData.saldo).toLocaleString('id-ID')}</h1>
                <p style={styles.cardNumber}>**** {userData.no_hp.slice(-4)}</p>
              </div>
            </div>
          </div>

          <div style={styles.cardContainer}>
            <h3 style={styles.sectionTitleWhite}>
              <IconBolt size={20} color="white" /> Isi Saldo Cepat
            </h3>
            <div style={styles.topUpPanel}>
              <div style={{display:'flex', gap:'12px', alignItems: 'center'}}>
                <input 
                  type="number" 
                  placeholder="Masukkan Nominal..." 
                  style={styles.inputTopUp} 
                  value={nominalTopUp} 
                  onChange={e=>setNominalTopUp(e.target.value)} 
                />
                <button onClick={handleTopUp} style={styles.btnTopUp}>+ TOP UP</button>
              </div>
              <div style={styles.quickAmountWrapper}>
                {[50000, 100000, 500000].map(amt => (
                  <button key={amt} onClick={()=>setNominalTopUp(amt)} style={styles.btnQuick}>
                    Rp {amt/1000}k
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: GRAFIK & HISTORY */}
        <div style={styles.gridAnalytics}>
          <div style={styles.cardContainer}>
            <h3 style={styles.sectionTitleDark}>
              <IconChart size={20} color="#0066CC" /> Grafik Keuangan Anda
            </h3>
            <div style={styles.cardBox}>
              <div style={{height: '340px', width: '100%'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0"/>
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="#666666" />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#666666" />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '8px', 
                        border:'1px solid #E0E0E0', 
                        boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
                        fontSize: '0.875rem'
                      }} 
                      cursor={{fill: '#F8F9FA'}}
                    />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '16px', fontSize: '0.875rem'}}/>
                    <Bar dataKey="kredit" name="Pemasukan" fill="#00AA13" radius={[4,4,0,0]} barSize={36} />
                    <Bar dataKey="debit" name="Pengeluaran" fill="#DC3545" radius={[4,4,0,0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={styles.cardContainer}>
            <h3 style={styles.sectionTitleDark}>
              <div style={{display:'flex', alignItems:'center', gap: '8px'}}>
                <IconHistory size={20} color="#666666" /> Riwayat Transaksi
              </div>
              <button onClick={fetchData} style={styles.btnRefreshMini} title="Refresh Data">⟳</button>
            </h3>
            <div style={styles.cardBox}>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Keterangan</th>
                      <th style={{...styles.th, textAlign:'right'}}>Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id_trx} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={{fontWeight:'600', color: '#1A1A1A', fontSize: '0.875rem'}}>
                            {item.merchant_name}
                          </div>
                          <div style={{fontSize:'0.75rem', color:'#999999', marginTop: '4px'}}>
                            {new Date(item.waktu).toLocaleDateString('id-ID')} • {new Date(item.waktu).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
                          </div>
                        </td>
                        <td style={{
                          ...styles.td, 
                          textAlign:'right', 
                          fontWeight:'600', 
                          color: item.tipe_transaksi==='kredit'?'#00AA13':'#DC3545', 
                          fontSize: '0.875rem'
                        }}>
                          {item.tipe_transaksi==='kredit' ? '+' : '-'} Rp {parseInt(item.nominal).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan="2" style={{
                          padding: '40px', 
                          textAlign: 'center', 
                          color: '#999999', 
                          fontStyle: 'italic',
                          fontSize: '0.875rem'
                        }}>
                          Belum ada transaksi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- MAIN APP ---
function App() {
  const [userSession, setUserSession] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.width = "100%";
    document.body.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    document.body.style.background = "#F8F9FA";
    
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      #root { max-width: none !important; width: 100% !important; margin: 0 !important; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-thumb { background: #CCCCCC; borderRadius: 3px; }
      ::-webkit-scrollbar-track { background: #F8F9FA; }
      * { box-sizing: border-box; }
    `;
    document.head.appendChild(styleTag);

    try {
      const savedUser = localStorage.getItem('gopay_user');
      if (savedUser) setUserSession(JSON.parse(savedUser));
    } catch(e) { localStorage.removeItem('gopay_user'); }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUserSession(userData);
    localStorage.setItem('gopay_user', JSON.stringify(userData));
  };

  const handleUpdateUser = (updatedData) => {
    const newUser = { ...userSession, ...updatedData };
    setUserSession(newUser);
    localStorage.setItem('gopay_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem('gopay_user');
  };

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false }), 3000);
  };

  return (
    <>
      {!userSession ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} showToast={showToast} />
      ) : (
        <Dashboard 
          userSession={userSession} 
          onLogout={handleLogout} 
          showToast={showToast} 
          refreshTrigger={userSession} 
          onUpdateUser={handleUpdateUser}
        />
      )}
      <Toast show={toast.show} message={toast.msg} type={toast.type} onClose={()=>setToast({show:false})} />
    </>
  );
}

const styles = {
  // LOGIN STYLES
  loginContainer: {
    minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)', position: 'relative', width: '100%'
  },
  patternOverlay: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
  },
  loginCard: {
    background: 'white', padding: '48px', borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)', width: '100%', maxWidth: '420px', zIndex: 2, textAlign: 'center'
  },
  loginHeader: { marginBottom: '32px' },
  loginLogoWrapper: { display: 'flex', justifyContent: 'center', marginBottom: '16px' },
  logoImageLarge: { 
    width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', 
    border: '3px solid #00AA13', padding: '3px', backgroundColor: 'white'
  },
  logoTitle: { 
    fontSize: '1.75rem', fontWeight: '700', margin: '0', color: '#1A1A1A', 
    letterSpacing: '-0.02em', lineHeight: '1.2'
  },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '16px', margin: '32px 0' },
  inputWrapper: { position: 'relative', marginBottom: '0' },
  input: {
    width: '100%', padding: '14px 14px 14px 44px', fontSize: '0.95rem',
    border: '1px solid #E0E0E0', borderRadius: '8px', outline: 'none', 
    color: '#1A1A1A', backgroundColor: '#FFFFFF', 
    boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  inputIcon: { position: 'absolute', left: '14px', top: '15px', zIndex: 1, opacity: 0.6 },
  btnPrimary: {
    width: '100%', padding: '14px', backgroundColor: '#00AA13', color: 'white',
    border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem',
    transition: 'background-color 0.2s', boxShadow: 'none'
  },
  toggleContainer: { marginTop: '24px', fontSize: '0.875rem', color: '#666666' }, 
  linkText: { color: '#0066CC', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' },

  // DASHBOARD STYLES
  homeContainer: { 
    minHeight: '100vh', display: 'flex', flexDirection: 'column', 
    position: 'relative', background: '#F8F9FA' 
  },
  patternOverlayDashboard: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '240px',
    background: 'linear-gradient(180deg, #0066CC 0%, #0052A3 100%)', 
    zIndex: 0
  },
  navbar: {
    background: 'white', height: '72px', display: 'flex', alignItems: 'center',
    padding: '0 40px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100
  },
  navContainer: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoImageNavbar: { 
    width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', 
    border: '2px solid #E0E0E0', backgroundColor: 'white'
  },
  logoText: { fontSize: '1.25rem', fontWeight: '700', color: '#1A1A1A', letterSpacing: '-0.01em' },
  navRight: { display: 'flex', alignItems: 'center' },
  profileSection: { display: 'flex', alignItems: 'center', gap: '16px', flexDirection: 'row' },
  avatarWrapper: { position: 'relative', cursor: 'pointer', width: '44px', height: '44px', flexShrink: 0 }, 
  avatarImg: { 
    width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', 
    border: '2px solid #E0E0E0' 
  },
  avatarPlaceholder: { 
    width: '100%', height: '100%', borderRadius: '50%', background: '#E0E0E0',
    display: 'flex', alignItems: 'center', justifyContent: 'center', 
    fontWeight: '600', color: '#666666', fontSize: '1rem'
  },
  cameraIcon: {
    position: 'absolute', bottom: -2, right: -2, background: '#0066CC',
    borderRadius: '50%', padding: '5px', display: 'flex', 
    alignItems: 'center', justifyContent: 'center', border: '2px solid white'
  },
  nameWrapper: { display: 'flex', alignItems: 'center', gap: '8px' },
  displayNameGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
  profileName: { fontWeight: '600', fontSize: '0.95rem', color: '#1A1A1A' },
  btnEditName: {
    background: 'none', border: 'none', color: '#666666', cursor: 'pointer', padding: '4px',
    display: 'flex', alignItems: 'center', transition: 'color 0.2s'
  },
  editNameGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
  inputNameEdit: {
    padding: '8px 12px', fontSize: '0.95rem', borderRadius: '6px',
    border: '1px solid #E0E0E0', outline: 'none', width: '200px',
    fontWeight: '600', color: '#1A1A1A', backgroundColor: 'white'
  },
  btnIconSave: { 
    background: '#00AA13', border: 'none', color: 'white', borderRadius: '6px', 
    padding: '8px 14px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' 
  },
  btnIconCancel: { 
    background: '#666666', border: 'none', color: 'white', borderRadius: '6px', 
    padding: '8px 14px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' 
  },
  btnLogoutRed: {
    padding: '10px 20px', backgroundColor: '#DC3545', color: 'white', border: 'none',
    borderRadius: '6px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s'
  },

  mainContent: { 
    padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%', 
    boxSizing: 'border-box', position: 'relative', zIndex: 1 
  },
  
  sectionTitleWhite: {
    fontSize: '1.125rem', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px', 
    display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.01em'
  },
  sectionTitleDark: {
    fontSize: '1.125rem', fontWeight: '600', color: '#1A1A1A', marginBottom: '16px', 
    display: 'flex', alignItems: 'center', gap: '8px',
    letterSpacing: '-0.01em'
  },

  topSection: { 
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '24px', marginBottom: '32px' 
  },
  cardContainer: { display: 'flex', flexDirection: 'column' },
  
  balanceCard: {
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    padding: '32px', borderRadius: '12px', color: 'white', position: 'relative', overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 102, 204, 0.15)', flex: 1, minHeight: '200px', 
    display: 'flex', flexDirection: 'column', justifyContent: 'center'
  },
  cardPattern: {
    position: 'absolute', top: 0, right: 0, width: '100%', height: '100%',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E")`
  },
  balanceBig: { 
    fontSize: '2.25rem', fontWeight: '700', margin: '12px 0', 
    letterSpacing: '-0.02em', lineHeight: '1.1' 
  },
  cardNumber: { 
    opacity: 0.7, letterSpacing: '2px', fontFamily: 'monospace', 
    fontSize: '0.875rem', marginTop: '8px' 
  },

  topUpPanel: { 
    background: 'white', padding: '32px', borderRadius: '12px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', 
    justifyContent: 'center', flex: 1, border: '1px solid #E0E0E0', minHeight: '200px'
  },
  inputTopUp: { 
    flex: 1, padding: '14px 16px', borderRadius: '8px', border: '1px solid #E0E0E0', 
    fontSize: '0.95rem', outline: 'none', backgroundColor: '#FFFFFF', 
    fontWeight: '500', color: '#1A1A1A' 
  },
  btnTopUp: { 
    padding: '14px 24px', background: '#0066CC', color: 'white', border: 'none', 
    borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', 
    whiteSpace: 'nowrap', transition: 'background 0.2s' 
  },
  quickAmountWrapper: { display: 'flex', gap: '8px', marginTop: '16px' },
  btnQuick: { 
    flex: 1, padding: '10px', background: '#F8F9FA', border: '1px solid #E0E0E0', 
    borderRadius: '8px', fontSize: '0.875rem', cursor: 'pointer', color: '#666666', 
    fontWeight: '500', transition: 'background 0.2s' 
  },

  gridAnalytics: { 
    display: 'grid', gridTemplateColumns: '1.6fr 1fr', 
    gap: '24px', alignItems: 'start' 
  },
  cardBox: { 
    background: 'white', padding: '24px', borderRadius: '12px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', minHeight: '420px', 
    border: '1px solid #E0E0E0' 
  },
  btnRefreshMini: { 
    background: '#F8F9FA', border: '1px solid #E0E0E0', borderRadius: '6px', 
    width: '32px', height: '32px', cursor: 'pointer', display: 'flex', 
    alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', 
    color: '#666666', fontWeight: '600', transition: 'background 0.2s' 
  },
  tableContainer: { overflowY: 'auto', maxHeight: '360px', paddingRight: '4px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { 
    textAlign: 'left', padding: '12px 8px', color: '#666666', fontSize: '0.8rem', 
    fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', 
    borderBottom: '2px solid #F0F0F0' 
  },
  tr: { 
    borderBottom: '1px solid #F8F9FA', 
    transition: 'background-color 0.2s' 
  },
  td: { padding: '14px 8px', fontSize: '0.875rem' },
  
  toast: { 
    position: 'fixed', bottom: '24px', right: '24px', padding: '14px 20px', 
    borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', 
    gap: '10px', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
  },
  toastMessage: { fontWeight: '600', fontSize: '0.875rem' },
  toastClose: { 
    background: 'none', border: 'none', color: 'white', marginLeft: '8px', 
    cursor: 'pointer', fontSize: '1.25rem', opacity: 0.8, lineHeight: '1' 
  }
};

export default App;