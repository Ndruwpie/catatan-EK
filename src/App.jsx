import React, { useState, useEffect } from 'react';
import { CheckCircle, Edit2, Save, XCircle, Calendar, DollarSign, RefreshCw, AlertCircle, Sun, Moon, TrendingUp, History, Download, Upload } from 'lucide-react';

function App() {
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [todayStatus, setTodayStatus] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode');
            if (saved !== null) return JSON.parse(saved);
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });
    const [historyData, setHistoryData] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwpMq2i4oJOItabAuNPyVask62ZYL87WhYXUHu9kIiZiyYzHDcsFuSrycdptj_kQVJi/exec";

    const checkStatus = async () => {
        setCheckingStatus(true);
        try {
            const response = await fetch(SCRIPT_URL);
            const result = await response.json();
            setTodayStatus(result);

            // Simulasi data history untuk contoh
            setHistoryData([
                { date: '2024-01-01', amount: 450000, time: '08:30' },
                { date: '2024-01-02', amount: 420000, time: '09:15' },
                { date: '2024-01-03', amount: 480000, time: '10:00' },
                { date: '2024-01-04', amount: 460000, time: '08:45' },
                { date: '2024-01-05', amount: 440000, time: '09:30' },
            ]);
        } catch (err) {
            console.error("Gagal cek status");
            setTodayStatus({ hasInput: false });
        } finally {
            setCheckingStatus(false);
        }
    };

    useEffect(() => {
        checkStatus();
        localStorage.setItem('darkMode', JSON.stringify(darkMode));

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

            // Refresh data setelah simpan
            setTimeout(() => checkStatus(), 500);
        } catch (err) {
            setStatus({ type: 'error', message: '❌ Terjadi kesalahan server!' });
        } finally {
            setLoading(false);
        }
    };

    const exportData = () => {
        const dataStr = JSON.stringify(historyData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `catatan-ek-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    // Styles untuk Light Mode
    const lightModeStyles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0f4f8 0%, #f8fafc 100%)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        },
        card: {
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        title: {
            fontSize: '32px',
            fontWeight: '800',
            color: '#1a365d',
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        subtitle: {
            fontSize: '16px',
            color: '#64748b',
            margin: '0'
        },
        statusBox: {
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '24px',
            borderRadius: '20px',
            border: '1px solid #e2e8f0'
        },
        inputGroup: { marginBottom: '24px' },
        label: {
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            color: '#475569',
            marginBottom: '12px'
        },
        inputWrap: {
            display: 'flex',
            alignItems: 'center',
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px 20px',
            transition: 'all 0.3s ease',
            background: 'white'
        },
        input: {
            border: 'none',
            width: '100%',
            fontSize: '24px',
            fontWeight: 'bold',
            outline: 'none',
            marginLeft: '12px',
            background: 'white',
            color: '#1a365d'
        },
        btnPrimary: {
            padding: '18px 32px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.3s ease'
        },
        btnSecondary: {
            padding: '12px 20px',
            borderRadius: '12px',
            border: 'none',
            background: '#e2e8f0',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#475569',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
        },
        msg: {
            marginTop: '20px',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '16px'
        }
    };

    // Styles untuk Dark Mode
    const darkModeStyles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        },
        card: {
            background: '#1e293b',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        title: {
            fontSize: '32px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        subtitle: {
            fontSize: '16px',
            color: '#94a3b8',
            margin: '0'
        },
        statusBox: {
            background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
            padding: '24px',
            borderRadius: '20px',
            border: '1px solid #475569'
        },
        inputGroup: { marginBottom: '24px' },
        label: {
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            color: '#e2e8f0',
            marginBottom: '12px'
        },
        inputWrap: {
            display: 'flex',
            alignItems: 'center',
            border: '2px solid #475569',
            borderRadius: '16px',
            padding: '16px 20px',
            transition: 'all 0.3s ease',
            background: '#1e293b'
        },
        input: {
            border: 'none',
            width: '100%',
            fontSize: '24px',
            fontWeight: 'bold',
            outline: 'none',
            marginLeft: '12px',
            background: '#1e293b',
            color: '#f1f5f9'
        },
        btnPrimary: {
            padding: '18px 32px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.3s ease'
        },
        btnSecondary: {
            padding: '12px 20px',
            borderRadius: '12px',
            border: 'none',
            background: '#475569',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#e2e8f0',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
        },
        msg: {
            marginTop: '20px',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '16px'
        }
    };

    const styles = darkMode ? darkModeStyles : lightModeStyles;

    return (
        <>
            <style>{`
                * {
                    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
                }
                body {
                    margin: 0;
                    padding: 0;
                }
                .hover-lift:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                .dark .hover-lift:hover {
                    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                }
                .stat-card {
                    transition: all 0.3s ease;
                }
                .stat-card:hover {
                    transform: translateY(-4px);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in {
                    animation: fadeIn 0.5s ease forwards;
                }
            `}</style>

            <div style={styles.container} className="p-8">
                <div style={styles.card} className="hover-lift p-8">
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div>
                            <h1 style={styles.title}>CATATAN EKSPEDISI</h1>
                            <p style={styles.subtitle}>Sistem Pencatatan Harian - Dashboard Lengkap</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                style={styles.btnSecondary}
                                className="hover-lift"
                            >
                                <History size={18} />
                                {showHistory ? 'Tutup Riwayat' : 'Lihat Riwayat'}
                            </button>
                            <button
                                onClick={exportData}
                                style={styles.btnSecondary}
                                className="hover-lift"
                            >
                                <Download size={18} />
                                Ekspor Data
                            </button>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                style={{
                                    background: darkMode ? '#334155' : '#e2e8f0',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '48px',
                                    height: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: darkMode ? '#fbbf24' : '#475569',
                                    transition: 'all 0.3s ease'
                                }}
                                className="hover-lift"
                                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {darkMode ? <Sun size={24} /> : <Moon size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                        {/* Status Box */}
                        <div style={styles.statusBox} className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Calendar size={24} color={darkMode ? '#60a5fa' : '#2563eb'} />
                                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#475569' }}>
                                        Status Hari Ini
                                    </span>
                                </div>
                                <RefreshCw
                                    size={20}
                                    onClick={checkStatus}
                                    style={{
                                        cursor: 'pointer',
                                        color: darkMode ? '#60a5fa' : '#2563eb',
                                        animation: checkingStatus ? 'spin 1s linear infinite' : 'none'
                                    }}
                                    className="hover-lift"
                                />
                            </div>
                            {checkingStatus ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        border: `4px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                                        borderTopColor: darkMode ? '#60a5fa' : '#2563eb',
                                        borderRadius: '50%',
                                        margin: '0 auto',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                </div>
                            ) : (
                                <div style={{ color: todayStatus?.hasInput ? '#059669' : (darkMode ? '#94a3b8' : '#64748b') }}>
                                    {todayStatus?.hasInput ? (
                                        <div>
                                            <div style={{
                                                fontSize: '48px',
                                                fontWeight: '800',
                                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                marginBottom: '8px'
                                            }}>
                                                Rp {todayStatus.amount?.toLocaleString()}
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: darkMode ? '#94a3b8' : '#64748b',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <span style={{
                                                    background: darkMode ? '#059669' : '#10b981',
                                                    color: 'white',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px'
                                                }}>
                                                    {todayStatus.time} WIB
                                                </span>
                                            </div>
                                            <button
                                                style={{
                                                    ...styles.btnSecondary,
                                                    marginTop: '20px',
                                                    background: darkMode ? '#475569' : '#e2e8f0'
                                                }}
                                                onClick={() => {
                                                    setIsEditing(true);
                                                    setAmount(todayStatus.amount.toString())
                                                }}
                                                className="hover-lift"
                                            >
                                                <Edit2 size={16} />
                                                Edit Data
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                            <AlertCircle size={64} color={darkMode ? '#94a3b8' : '#64748b'} />
                                            <p style={{ fontSize: '18px', marginTop: '16px' }}>
                                                Belum ada input hari ini
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Input Form */}
                        <div className="fade-in">
                            <div style={{
                                background: darkMode ? '#1e293b' : 'white',
                                padding: '32px',
                                borderRadius: '20px',
                                border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                                height: '100%'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <TrendingUp size={24} color={darkMode ? '#60a5fa' : '#2563eb'} />
                                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#475569' }}>
                                        {isEditing ? "Edit Data" : "Input Data Baru"}
                                    </span>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Jumlah Pemasukan</label>
                                        <div style={{ ...styles.inputWrap, borderColor: amount ? (darkMode ? '#60a5fa' : '#2563eb') : undefined }}>
                                            <DollarSign size={28} color={darkMode ? '#94a3b8' : '#64748b'} />
                                            <input
                                                type="number"
                                                style={styles.input}
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="Masukkan angka (400000-500000)"
                                                min="400000"
                                                max="500000"
                                            />
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginTop: '8px'
                                        }}>
                                            <small style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                                                Range yang diperbolehkan: 400.000 - 500.000
                                            </small>
                                            {amount && (
                                                <small style={{
                                                    color: parseInt(amount) >= 400000 && parseInt(amount) <= 500000
                                                        ? '#059669'
                                                        : '#dc2626',
                                                    fontWeight: '600'
                                                }}>
                                                    {parseInt(amount) >= 400000 && parseInt(amount) <= 500000
                                                        ? '✓ Valid'
                                                        : '✗ Tidak valid'}
                                                </small>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || (todayStatus?.hasInput && !isEditing)}
                                        style={{
                                            ...styles.btnPrimary,
                                            opacity: (loading || (!isEditing && todayStatus?.hasInput)) ? 0.6 : 1,
                                            cursor: (loading || (!isEditing && todayStatus?.hasInput)) ? 'not-allowed' : 'pointer'
                                        }}
                                        className="hover-lift"
                                    >
                                        {loading ? (
                                            <>
                                                <div style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    border: `2px solid white`,
                                                    borderTopColor: 'transparent',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite'
                                                }}></div>
                                                Memproses...
                                            </>
                                        ) : isEditing ? (
                                            <>
                                                <Save size={20} />
                                                Update Data
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={20} />
                                                Simpan Data
                                            </>
                                        )}
                                    </button>

                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            style={{
                                                ...styles.btnSecondary,
                                                width: '100%',
                                                marginTop: '16px',
                                                background: darkMode ? '#475569' : '#e2e8f0',
                                                color: darkMode ? '#e2e8f0' : '#475569'
                                            }}
                                            className="hover-lift"
                                        >
                                            <XCircle size={18} />
                                            Batal Edit
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* History Section */}
                    {showHistory && (
                        <div className="fade-in" style={{ marginTop: '32px' }}>
                            <div style={{
                                background: darkMode ? '#1e293b' : 'white',
                                padding: '32px',
                                borderRadius: '20px',
                                border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <History size={24} color={darkMode ? '#60a5fa' : '#2563eb'} />
                                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#475569' }}>
                                        Riwayat Pemasukan
                                    </span>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: '16px'
                                }}>
                                    {historyData.map((item, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                background: darkMode ? '#334155' : '#f8fafc',
                                                padding: '20px',
                                                borderRadius: '16px',
                                                border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                                                transition: 'all 0.3s ease'
                                            }}
                                            className="stat-card"
                                        >
                                            <div style={{
                                                fontSize: '14px',
                                                color: darkMode ? '#94a3b8' : '#64748b',
                                                marginBottom: '8px'
                                            }}>
                                                {item.date}
                                            </div>
                                            <div style={{
                                                fontSize: '24px',
                                                fontWeight: 'bold',
                                                color: darkMode ? '#e2e8f0' : '#1a365d'
                                            }}>
                                                Rp {item.amount.toLocaleString()}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: darkMode ? '#60a5fa' : '#2563eb',
                                                marginTop: '4px'
                                            }}>
                                                {item.time} WIB
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {historyData.length === 0 && (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px 0',
                                        color: darkMode ? '#94a3b8' : '#64748b'
                                    }}>
                                        <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                        <p>Tidak ada data riwayat</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Status Message */}
                    {status.message && (
                        <div className="fade-in" style={{
                            ...styles.msg,
                            background: status.type === 'success'
                                ? (darkMode ? '#065f46' : 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)')
                                : (darkMode ? '#7f1d1d' : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'),
                            color: status.type === 'success'
                                ? (darkMode ? '#d1fae5' : '#166534')
                                : (darkMode ? '#fecaca' : '#991b1b'),
                            border: `1px solid ${status.type === 'success'
                                ? (darkMode ? '#059669' : '#10b981')
                                : (darkMode ? '#dc2626' : '#ef4444')}`,
                            marginTop: '32px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                {status.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                {status.message}
                            </div>
                        </div>
                    )}

                    {/* Statistics Summary */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '20px',
                        marginTop: '32px'
                    }}>
                        <div style={{
                            background: darkMode ? '#334155' : '#f8fafc',
                            padding: '20px',
                            borderRadius: '16px',
                            border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                            textAlign: 'center'
                        }} className="stat-card">
                            <div style={{
                                fontSize: '14px',
                                color: darkMode ? '#94a3b8' : '#64748b',
                                marginBottom: '8px'
                            }}>
                                Total Data
                            </div>
                            <div style={{
                                fontSize: '32px',
                                fontWeight: 'bold',
                                color: darkMode ? '#e2e8f0' : '#1a365d'
                            }}>
                                {historyData.length}
                            </div>
                        </div>

                        <div style={{
                            background: darkMode ? '#334155' : '#f8fafc',
                            padding: '20px',
                            borderRadius: '16px',
                            border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                            textAlign: 'center'
                        }} className="stat-card">
                            <div style={{
                                fontSize: '14px',
                                color: darkMode ? '#94a3b8' : '#64748b',
                                marginBottom: '8px'
                            }}>
                                Rata-rata
                            </div>
                            <div style={{
                                fontSize: '32px',
                                fontWeight: 'bold',
                                color: darkMode ? '#e2e8f0' : '#1a365d'
                            }}>
                                Rp {historyData.length > 0
                                    ? Math.round(historyData.reduce((a, b) => a + b.amount, 0) / historyData.length).toLocaleString()
                                    : '0'}
                            </div>
                        </div>

                        <div style={{
                            background: darkMode ? '#334155' : '#f8fafc',
                            padding: '20px',
                            borderRadius: '16px',
                            border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                            textAlign: 'center'
                        }} className="stat-card">
                            <div style={{
                                fontSize: '14px',
                                color: darkMode ? '#94a3b8' : '#64748b',
                                marginBottom: '8px'
                            }}>
                                Status Hari Ini
                            </div>
                            <div style={{
                                fontSize: '32px',
                                fontWeight: 'bold',
                                color: todayStatus?.hasInput ? '#059669' : '#dc2626'
                            }}>
                                {todayStatus?.hasInput ? '✓' : '✗'}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        marginTop: '40px',
                        paddingTop: '20px',
                        borderTop: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                        textAlign: 'center',
                        color: darkMode ? '#94a3b8' : '#64748b',
                        fontSize: '14px'
                    }}>
                        <p>© {new Date().getFullYear()} Catatan EK - Sistem Pencatatan Harian Ekspedisi</p>
                        <p style={{ fontSize: '12px', marginTop: '8px' }}>
                            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
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