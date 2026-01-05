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

    // Styles dengan CSS Variables untuk dark/light mode
    const styles = {
        container: {
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            transition: 'background-color 0.3s ease'
        },
        card: {
            background: 'var(--bg-card)',
            padding: 'clamp(20px, 5vw, 30px)',
            borderRadius: 'clamp(16px, 4vw, 20px)',
            boxShadow: 'var(--shadow)',
            width: '100%',
            maxWidth: 'min(400px, 90vw)',
            border: '1px solid var(--border)',
            transition: 'all 0.3s ease'
        },
        title: {
            fontSize: 'clamp(20px, 5vw, 24px)',
            fontWeight: '800',
            color: 'var(--text-primary)',
            textAlign: 'center',
            margin: '0 0 5px 0'
        },
        subtitle: {
            fontSize: 'clamp(12px, 3vw, 14px)',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            margin: '0 0 25px 0'
        },
        statusBox: {
            background: 'var(--bg-secondary)',
            padding: 'clamp(12px, 4vw, 15px)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            marginBottom: '20px'
        },
        inputGroup: { marginBottom: '20px' },
        label: {
            display: 'block',
            fontSize: 'clamp(13px, 3vw, 14px)',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            marginBottom: '8px'
        },
        inputWrap: {
            display: 'flex',
            alignItems: 'center',
            border: '2px solid var(--border)',
            borderRadius: '12px',
            padding: 'clamp(10px, 3vw, 12px)',
            background: 'var(--bg-input)',
            transition: 'border-color 0.3s ease'
        },
        input: {
            border: 'none',
            width: '100%',
            fontSize: 'clamp(16px, 4vw, 18px)',
            fontWeight: 'bold',
            outline: 'none',
            marginLeft: '10px',
            background: 'transparent',
            color: 'var(--text-primary)',
            caretColor: 'var(--primary)'
        },
        btnPrimary: {
            width: '100%',
            padding: 'clamp(14px, 4vw, 15px)',
            borderRadius: '12px',
            border: 'none',
            background: 'var(--primary)',
            color: 'white',
            fontSize: 'clamp(15px, 3vw, 16px)',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        },
        btnSecondary: {
            padding: 'clamp(6px, 2vw, 8px) clamp(10px, 2vw, 12px)',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--bg-secondary)',
            cursor: 'pointer',
            fontSize: 'clamp(11px, 2.5vw, 12px)',
            color: 'var(--text-primary)',
            fontWeight: '500',
            transition: 'all 0.2s ease'
        },
        msg: {
            marginTop: '20px',
            padding: 'clamp(10px, 3vw, 12px)',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
        }
    };

    return (
        <>
            {/* CSS Variables untuk Dark/Light Mode */}
            <style>{`
                :root {
                    --primary: #2563eb;
                    --primary-hover: #1d4ed8;
                    --success: #059669;
                    --error: #dc2626;
                    
                    /* Light Mode */
                    --bg-primary: #f0f4f8;
                    --bg-card: #ffffff;
                    --bg-secondary: #f8fafc;
                    --bg-input: #ffffff;
                    --text-primary: #1a365d;
                    --text-secondary: #64748b;
                    --border: #e2e8f0;
                    --shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                
                .dark {
                    --primary: #3b82f6;
                    --primary-hover: #2563eb;
                    --success: #10b981;
                    --error: #ef4444;
                    
                    /* Dark Mode */
                    --bg-primary: #0f172a;
                    --bg-card: #1e293b;
                    --bg-secondary: #334155;
                    --bg-input: #1e293b;
                    --text-primary: #f1f5f9;
                    --text-secondary: #94a3b8;
                    --border: #475569;
                    --shadow: 0 10px 25px rgba(0,0,0,0.3);
                }
                
                /* Responsive Font Sizes */
                html {
                    font-size: 16px;
                }
                
                @media (max-width: 768px) {
                    html {
                        font-size: 14px;
                    }
                }
                
                @media (max-width: 480px) {
                    html {
                        font-size: 13px;
                    }
                }
                
                /* Button hover effects */
                button:hover:not(:disabled) {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                
                button:active:not(:disabled) {
                    transform: translateY(0);
                }
                
                /* Disabled button */
                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                }
                
                /* Focus styles for accessibility */
                *:focus {
                    outline: 2px solid var(--primary);
                    outline-offset: 2px;
                }
                
                /* Smooth transitions */
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
                        marginBottom: '20px'
                    }}>
                        <div>
                            <h1 style={styles.title}>CATATAN EK</h1>
                            <p style={styles.subtitle}>Sistem Pencatatan Harian</p>
                        </div>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border)',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--text-primary)'
                            }}
                            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>

                    <div style={styles.statusBox}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 'clamp(12px, 3vw, 13px)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                Status Hari Ini:
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {checkingStatus && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mengecek...</span>}
                                <RefreshCw
                                    size={16}
                                    onClick={checkStatus}
                                    style={{
                                        cursor: 'pointer',
                                        color: 'var(--primary)',
                                        animation: checkingStatus ? 'spin 1s linear infinite' : 'none'
                                    }}
                                />
                            </div>
                        </div>
                        {!checkingStatus && (
                            <div style={{ marginTop: '10px', color: todayStatus?.hasInput ? 'var(--success)' : 'var(--text-secondary)' }}>
                                {todayStatus?.hasInput ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <b>Rp {todayStatus.amount?.toLocaleString()}</b>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{todayStatus.time} WIB</div>
                                        </div>
                                        <button
                                            style={styles.btnSecondary}
                                            onClick={() => {
                                                setIsEditing(true);
                                                setAmount(todayStatus.amount.toString());
                                            }}
                                        >
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
                            <label style={styles.label}>
                                {isEditing ? "Edit Data" : "Input Baru"}
                            </label>
                            <div style={styles.inputWrap}>
                                <DollarSign size={20} color="var(--text-secondary)" />
                                <input
                                    type="number"
                                    style={styles.input}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="450000"
                                    required
                                    min="400000"
                                    max="500000"
                                    step="1000"
                                />
                            </div>
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                                Range: 400k - 500k
                            </small>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (todayStatus?.hasInput && !isEditing)}
                            style={{
                                ...styles.btnPrimary,
                                background: loading ? '#94a3b8' : (isEditing ? 'var(--success)' : 'var(--primary)'),
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                    Memproses...
                                </span>
                            ) : isEditing ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Save size={16} />
                                    Update Data
                                </span>
                            ) : (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <CheckCircle size={16} />
                                    Simpan Sekarang
                                </span>
                            )}
                        </button>

                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                style={{
                                    ...styles.btnSecondary,
                                    width: '100%',
                                    marginTop: '10px',
                                    background: 'transparent',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <XCircle size={16} />
                                    Batal Edit
                                </span>
                            </button>
                        )}
                    </form>

                    {status.message && (
                        <div style={{
                            ...styles.msg,
                            background: status.type === 'success'
                                ? 'var(--success)'
                                : 'var(--error)',
                            color: 'white',
                            opacity: status.message ? 1 : 0,
                            transform: status.message ? 'translateY(0)' : 'translateY(-10px)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                {status.message}
                            </div>
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