import React, { useState } from 'react';

function App() {
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    // MASUKKAN URL GOOGLE SCRIPT KAMU DI SINI
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyxX7t-fDmaAhW8IGyyVdxHBMRHxV4Kz8iPA6rCxIcV-ucEKE3yBbBq7Hg7a5Hv2BJi/exec";

    const handleSubmit = async (e) => {
        e.preventDefault();
        const val = parseInt(amount);

        if (val < 400000 || val > 500000) {
            setStatus({ type: 'error', message: '❌ Gagal! Range harus 400rb - 500rb' });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('pemasukan', val);
            await fetch(SCRIPT_URL, { method: 'POST', body: formData, mode: 'no-cors' });
            setStatus({ type: 'success', message: '✅ Berhasil disimpan!' });
            setAmount('');
        } catch (error) {
            setStatus({ type: 'error', message: '❌ Terjadi kesalahan!' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-800">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
                <h1 className="text-3xl font-black text-center text-blue-600 mb-2">CATATAN EK</h1>
                <p className="text-slate-400 text-center mb-8 font-medium">Input pemasukan harian Anda</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 ml-1">Jumlah (IDR)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="450000"
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg font-bold"
                            required
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300"
                    >
                        {loading ? "MEMPROSES..." : "SIMPAN SEKARANG"}
                    </button>
                </form>

                {status.message && (
                    <div className={`mt-6 p-4 rounded-2xl text-center font-bold animate-bounce ${status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {status.message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;