import React, { useState, useEffect } from 'react';
import { CheckCircle, Edit2, Save, XCircle, Calendar, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';

function App() {
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [todayStatus, setTodayStatus] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

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

    useEffect(() => { checkStatus(); }, []);

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

    // Styles Object (Internal CSS)
    const styles = {
        container: { minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' },
        card: { background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
        title: { fontSize: '24px', fontWeight: '800', color: '#1a365d', textAlign: 'center', margin: '0 0 5px 0' },
        subtitle: { fontSize: '14px', color: '#64748b', textAlign: 'center', margin: '0 0 25px 0' },
        statusBox: { background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' },
        inputGroup: { marginBottom: '20px' },
        label: { display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' },
        inputWrap: { display: 'flex', alignItems: 'center', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '12px' },
        input: { border: 'none', width: '100%', fontSize: '18px', fontWeight: 'bold', outline: 'none', marginLeft: '10px' },
        btnPrimary: { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
        btnSecondary: { padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#e2e8f0', cursor: 'pointer', fontSize: '12px' },
        msg: { marginTop: '20px', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>CATATAN EK</h1>
                <p style={styles.subtitle}>Sistem Pencatatan Harian</p>

                <div style={styles.statusBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Status Hari Ini:</span>
                        <RefreshCw size={16} onClick={checkStatus} style={{ cursor: 'pointer', color: '#2563eb' }} />
                    </div>
                    {checkingStatus ? <p>Mengecek...</p> : (
                        <div style={{ marginTop: '10px', color: todayStatus?.hasInput ? '#059669' : '#64748b' }}>
                            {todayStatus?.hasInput ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <b>Rp {todayStatus.amount?.toLocaleString()}</b>
                                        <div style={{ fontSize: '11px' }}>{todayStatus.time} WIB</div>
                                    </div>
                                    <button style={styles.btnSecondary} onClick={() => { setIsEditing(true); setAmount(todayStatus.amount) }}>Edit</button>
                                </div>
                            ) : "Belum ada input hari ini"}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>{isEditing ? "Edit Data" : "Input Baru"}</label>
                        <div style={styles.inputWrap}>
                            <DollarSign size={20} color="#94a3b8" />
                            <input
                                type="number"
                                style={styles.input}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="450000"
                            />
                        </div>
                        <small style={{ color: '#94a3b8' }}>Range: 400k - 500k</small>
                    </div>

                    <button type="submit" disabled={loading || (todayStatus?.hasInput && !isEditing)}
                        style={{ ...styles.btnPrimary, background: loading ? '#94a3b8' : (isEditing ? '#059669' : '#2563eb') }}>
                        {loading ? "Memproses..." : (isEditing ? "Update Data" : "Simpan Sekarang")}
                    </button>

                    {isEditing && <button type="button" onClick={() => setIsEditing(false)} style={{ ...styles.btnSecondary, width: '100%', marginTop: '10px' }}>Batal</button>}
                </form>

                {status.message && (
                    <div style={{ ...styles.msg, background: status.type === 'success' ? '#dcfce7' : '#fee2e2', color: status.type === 'success' ? '#166534' : '#991b1b' }}>
                        {status.message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;