import React, { useState, useEffect } from 'react';
import { CheckCircle, Edit2, Save, XCircle, Calendar, DollarSign, RefreshCw, AlertCircle, Sun, Moon } from 'lucide-react';

function App() {
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [todayStatus, setTodayStatus] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        // Cek preferensi sistem atau localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode');
            if (saved !== null) return JSON.parse(saved);
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // GANTI DENGAN URL GOOGLE SCRIPT KAMU
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwpMq2i4oJOItabAuNPyVask62ZYL87WhYXUHu9kIiZiyYzHDcsFuSrycdptj_kQVJi/exec";

    const checkStatus = async () => {
        setCheckingStatus(true);
        try {
            const response = await fetch(SCRIPT_URL);
            const result = await response.json();
            setTodayStatus(result);
        } catch (err) {
            console.error("Gagal cek status");
            setTodayStatus({ hasInput: false });
        } finally {
            setCheckingStatus(false);
        }
    };

    useEffect(() => {
        checkStatus();

        // Sync dengan localStorage
        localStorage.setItem('darkMode', JSON.stringify(darkMode));

        // Tambahkan/toggle class dark di root
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const val = parseInt(amount);

        if (val < 400000 || val > 500000) {
            setStatus({ type: 'error', message: '❌ Range harus 400rb - 500rb' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const formData = new FormData();
            formData.append('pemasukan', val);
            if (isEditing && todayStatus?.row) {
                formData.append('row', todayStatus.row);
            }

            await fetch(SCRIPT_URL, { method: 'POST', body: formData, mode: 'no-cors' });

            setStatus({ type: 'success', message: isEditing ? '✅ Berhasil diupdate!' : '✅ Berhasil disimpan!' });
            setTodayStatus({
                hasInput: true,
                amount: val,
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                row: todayStatus?.row || null
            });
            setAmount('');
            setIsEditing(false);
        } catch (err) {
            setStatus({ type: 'error', message: '❌ Terjadi kesalahan server!' });
        } finally {
            setLoading(false);
        }
    };

    // Styles untuk Light Mode (default)
    const lightModeStyles = {
        container: { minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' },
        card: { background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
        title: { fontSize: '24px', fontWeight: '800', color: '#1a365d', textAlign: 'center', margin: '0 0 5px 0' },
        subtitle: { fontSize: '14px', color: '#64748b', textAlign: 'center', margin: '0 0 25px 0' },
        statusBox: { background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' },
        inputGroup: { marginBottom: '20px' },
        label: { display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' },
        inputWrap: { display: 'flex', alignItems: 'center', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '12px' },
        input: { border: 'none', width: '100%', fontSize: '18px', fontWeight: 'bold', outline: 'none', marginLeft: '10px', background: 'white', color: '#1a365d' },
        btnPrimary: { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
        btnSecondary: { padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#e2e8f0', cursor: 'pointer', fontSize: '12px', color: '#475569' },
        msg: { marginTop: '20px', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }
    };

    // Styles untuk Dark Mode
    const darkModeStyles = {
        container: { minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' },
        card: { background: '#1e293b', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px' },
        title: { fontSize: '24px', fontWeight: '800', color: '#f1f5f9', textAlign: 'center', margin: '0 0 5px 0' },
        subtitle: { fontSize: '14px', color: '#94a3b8', textAlign: 'center', margin: '0 0 25px 0' },
        statusBox: { background: '#334155', padding: '15px', borderRadius: '12px', border: '1px solid #475569', marginBottom: '20px' },
        inputGroup: { marginBottom: '20px' },
        label: { display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '8px' },
        inputWrap: { display: 'flex', alignItems: 'center', border: '2px solid #475569', borderRadius: '12px', padding: '12px', background: '#1e293b' },
        input: { border: 'none', width: '100%', fontSize: '18px', fontWeight: 'bold', outline: 'none', marginLeft: '10px', background: '#1e293b', color: '#f1f5f9' },
        btnPrimary: { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
        btnSecondary: { padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#475569', cursor: 'pointer', fontSize: '12px', color: '#e2e8f0' },
        msg: { marginTop: '20px', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }
    };

    // Pilih styles berdasarkan mode
    const styles = darkMode ? darkModeStyles : lightModeStyles;

    return (
        <>
            {/* CSS untuk smooth transition */}
            <style>{`
                * {
                    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
                }
            `}</style>

            <div style={styles.container}>
                <div style={styles.card}>
                    {/* Header dengan toggle dark mode */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                    }}>
                        <div>
                            <h1 style={styles.title}>CATATAN EK</h1>
                            <p style={styles.subtitle}>Sistem Pencatatan Harian</p>
                        </div>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            style={{
                                background: darkMode ? '#334155' : '#e2e8f0',
                                border: '1px solid',
                                borderColor: darkMode ? '#475569' : '#cbd5e1',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: darkMode ? '#fbbf24' : '#475569'
                            }}
                            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>

                    <div style={styles.statusBox}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#475569' }}>
                                Status Hari Ini:
                            </span>
                            <RefreshCw
                                size={16}
                                onClick={checkStatus}
                                style={{
                                    cursor: 'pointer',
                                    color: darkMode ? '#60a5fa' : '#2563eb',
                                    animation: checkingStatus ? 'spin 1s linear infinite' : 'none'
                                }}
                            />
                        </div>
                        {checkingStatus ? <p style={{ color: darkMode ? '#cbd5e1' : '#64748b', marginTop: '10px' }}>Mengecek...</p> : (
                            <div style={{ marginTop: '10px', color: todayStatus?.hasInput ? '#059669' : (darkMode ? '#94a3b8' : '#64748b') }}>
                                {todayStatus?.hasInput ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <b>Rp {todayStatus.amount?.toLocaleString()}</b>
                                            <div style={{ fontSize: '11px', color: darkMode ? '#94a3b8' : '#64748b' }}>{todayStatus.time} WIB</div>
                                        </div>
                                        <button style={styles.btnSecondary} onClick={() => { setIsEditing(true); setAmount(todayStatus.amount.toString()) }}>
                                            Edit
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <AlertCircle size={14} />
                                        Belum ada input hari ini
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>{isEditing ? "Edit Data" : "Input Baru"}</label>
                            <div style={styles.inputWrap}>
                                <DollarSign size={20} color={darkMode ? '#94a3b8' : '#64748b'} />
                                <input
                                    type="number"
                                    style={styles.input}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="450000"
                                />
                            </div>
                            <small style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Range: 400k - 500k</small>
                        </div>

                        <button type="submit" disabled={loading || (todayStatus?.hasInput && !isEditing)}
                            style={{
                                ...styles.btnPrimary,
                                background: loading ? (darkMode ? '#64748b' : '#94a3b8') :
                                    (isEditing ? (darkMode ? '#10b981' : '#059669') :
                                        (darkMode ? '#3b82f6' : '#2563eb')),
                                opacity: loading ? 0.7 : 1
                            }}>
                            {loading ? "Memproses..." : (isEditing ? "Update Data" : "Simpan Sekarang")}
                        </button>

                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                style={{
                                    ...styles.btnSecondary,
                                    width: '100%',
                                    marginTop: '10px',
                                    background: darkMode ? '#475569' : '#e2e8f0',
                                    color: darkMode ? '#e2e8f0' : '#475569'
                                }}
                            >
                                Batal
                            </button>
                        )}
                    </form>

                    {status.message && (
                        <div style={{
                            ...styles.msg,
                            background: status.type === 'success'
                                ? (darkMode ? '#065f46' : '#dcfce7')
                                : (darkMode ? '#7f1d1d' : '#fee2e2'),
                            color: status.type === 'success'
                                ? (darkMode ? '#d1fae5' : '#166534')
                                : (darkMode ? '#fecaca' : '#991b1b')
                        }}>
                            {status.message}
                        </div>
                    )}
                </div>
            </div>

            {/* Tambahkan CSS animation untuk spin */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}

export default App;