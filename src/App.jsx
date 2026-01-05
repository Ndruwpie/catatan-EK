import React, { useState, useEffect } from 'react';
import { CheckCircle, Edit2, Save, XCircle, Calendar, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';

function App() {
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [todayStatus, setTodayStatus] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyxX7t-fDmaAhW8IGyyVdxHBMRHxV4Kz8iPA6rCxIcV-ucEKE3yBbBq7Hg7a5Hv2BJi/exec";


    // Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Fungsi untuk memeriksa status input hari ini
    const checkTodayStatus = async () => {
        setCheckingStatus(true);
        try {
            // Simulasi cek status (ganti dengan API call ke Google Sheets)
            setTimeout(() => {
                const mockStatus = Math.random() > 0.5 ? {
                    hasInput: true,
                    amount: Math.floor(Math.random() * (500000 - 400000 + 1)) + 400000,
                    time: "09:30"
                } : {
                    hasInput: false,
                    amount: null,
                    time: null
                };
                setTodayStatus(mockStatus);
                setCheckingStatus(false);
            }, 1000);
        } catch (err) {
            setStatus({ type: 'error', message: '❌ Gagal memeriksa status' });
            setCheckingStatus(false);
        }
    };

    // Cek status saat pertama kali load menggunakan callback
    useEffect(() => {
        const initialCheck = async () => {
            await checkTodayStatus();
        };
        initialCheck();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const val = parseInt(amount);

        if (val < 400000 || val > 500000) {
            setStatus({ type: 'error', message: '❌ Range harus 400rb - 500rb' });
            return;
        }

        if (todayStatus?.hasInput && !isEditing) {
            setStatus({ type: 'warning', message: '⚠️ Hari ini sudah ada input. Klik "Edit" untuk mengubah.' });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('pemasukan', val);
            formData.append('date', getTodayDate());
            formData.append('action', isEditing ? 'edit' : 'add');

            // Simulasi API call
            setTimeout(() => {
                setStatus({
                    type: 'success',
                    message: isEditing ? '✅ Berhasil diupdate!' : '✅ Berhasil disimpan!'
                });

                // Update status lokal
                setTodayStatus({
                    hasInput: true,
                    amount: val,
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                });

                setAmount('');
                setIsEditing(false);
                setLoading(false);
            }, 1500);

        } catch (err) {
            setStatus({ type: 'error', message: '❌ Terjadi kesalahan!' });
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        if (todayStatus?.hasInput) {
            setIsEditing(true);
            setAmount(todayStatus.amount.toString());
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setAmount('');
        setStatus({ type: '', message: '' });
    };

    const getStatusColor = (type) => {
        switch (type) {
            case 'success': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'error': return 'bg-red-50 text-red-700 border-red-200';
            case 'warning': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-slate-50 text-slate-700';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5" />;
            case 'error': return <XCircle className="h-5 w-5" />;
            case 'warning': return <AlertCircle className="h-5 w-5" />;
            default: return null;
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 flex items-center justify-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white shadow-lg">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800">CATATAN EK</h1>
                            <p className="text-sm font-medium text-slate-400">Pencatatan Pemasukan Harian</p>
                        </div>
                    </div>

                    {/* Tanggal */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2">
                        <Calendar size={16} className="text-blue-600" />
                        <span className="font-semibold text-blue-700">
                            {new Date().toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                {/* Status Card */}
                <div className="mb-6">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 font-semibold text-slate-700">
                                <CheckCircle size={18} className="text-slate-400" />
                                Status Input Hari Ini
                            </h3>
                            <button
                                onClick={checkTodayStatus}
                                disabled={checkingStatus}
                                className="rounded-lg p-2 transition-colors hover:bg-white disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={`text-blue-600 ${checkingStatus ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {checkingStatus ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                            </div>
                        ) : todayStatus ? (
                            <div className={`p-4 rounded-xl ${todayStatus.hasInput ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-100 border border-slate-200'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-800">
                                            {todayStatus.hasInput ? '✓ Sudah diinput' : 'Belum diinput'}
                                        </p>
                                        {todayStatus.hasInput && (
                                            <>
                                                <p className="mt-1 text-lg font-bold text-emerald-700">
                                                    Rp {todayStatus.amount.toLocaleString('id-ID')}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Waktu: {todayStatus.time}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    {todayStatus.hasInput && !isEditing && (
                                        <button
                                            onClick={handleEditClick}
                                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                        >
                                            <Edit2 size={16} />
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Form Input */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <DollarSign size={16} />
                            {isEditing ? 'Edit Jumlah Pemasukan (IDR)' : 'Jumlah Pemasukan (IDR)'}
                        </label>
                        <div className="relative">
                            <div className="absolute top-1/2 left-4 -translate-y-1/2 font-medium text-slate-400">
                                Rp
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="450000"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg font-bold placeholder-slate-400"
                                required
                                min="400000"
                                max="500000"
                            />
                        </div>
                        <p className="ml-1 text-xs text-slate-500">
                            Range: Rp 400.000 - Rp 500.000
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 py-4 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                    <XCircle size={18} />
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 py-4 font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:from-emerald-600 hover:to-green-700 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Update
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading || (todayStatus?.hasInput && !isEditing)}
                                className={`w-full py-4 rounded-2xl font-semibold shadow-lg transition-all ${todayStatus?.hasInput && !isEditing
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white active:scale-95'}`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                                        Menyimpan...
                                    </span>
                                ) : (
                                    'SIMPAN SEKARANG'
                                )}
                            </button>
                        )}
                    </div>
                </form>

                {/* Status Message */}
                {status.message && (
                    <div className={`mt-6 p-4 rounded-xl border ${getStatusColor(status.type)} animate-in fade-in duration-300`}>
                        <div className="flex items-center gap-3">
                            {getIcon(status.type)}
                            <span className="font-medium">{status.message}</span>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="mt-8 border-t border-slate-200 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-blue-50 p-3 text-center">
                            <p className="text-xs font-medium text-blue-600">Bulan Ini</p>
                            <p className="text-lg font-bold text-slate-800">Rp 12.5jt</p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-center">
                            <p className="text-xs font-medium text-emerald-600">Hari Kerja</p>
                            <p className="text-lg font-bold text-slate-800">18/22</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400">
                        Pastikan input sesuai dengan pemasukan aktual. Data akan tersimpan di Google Sheets.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;