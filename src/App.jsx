import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Download,
  Edit2,
  Moon,
  RefreshCw,
  Sun,
} from 'lucide-react';
import ExcelJS from 'exceljs';
import './App.css';

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyBzdwYbNle4MfR33Ep6XJvTzynhszbkQLwORl3W09-Lc34rGFlFOH6g3FPzuCHklb1/exec';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const pad2 = (value) => String(value).padStart(2, '0');

const toInputDate = (date) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}`;
};

const CATEGORY_OPTIONS = [
  'Gorengan',
  'Jajanan',
  'Jastip makan siang',
  'Jastip lainnya',
];

const normalizeDate = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const normalizeEntry = (item) => {
  if (Array.isArray(item)) {
    const rawCategory = item[2];
    const rawTime = item[3];
    const inferredCategory =
      typeof rawCategory === 'string' && rawCategory.includes(':') ? '' : rawCategory;
    const inferredTime =
      typeof rawCategory === 'string' && rawCategory.includes(':') ? rawCategory : rawTime;
    const inferredRow = item.length >= 5 ? item[4] : item[3];
    return {
      date: normalizeDate(item[0]),
      amount: Number(item[1]),
      category: inferredCategory || '',
      time: inferredTime || '',
      row: inferredRow || null,
    };
  }

  return {
    date: normalizeDate(item?.date || item?.tanggal || item?.day || item?.createdAt),
    amount: Number(item?.amount || item?.pemasukan || item?.nominal),
    category: item?.category || item?.kategori || '',
    time: item?.time || item?.jam || '',
    row: item?.row || item?.rowIndex || null,
  };
};

const parseHistory = (result) => {
  const raw =
    (Array.isArray(result) && result) ||
    result?.history ||
    result?.data ||
    result?.records ||
    result?.items ||
    [];

  return raw
    .map(normalizeEntry)
    .filter((item) => Number.isFinite(item.amount) && item.amount > 0 && item.date);
};

const formatDateLong = (value) => {
  if (!value) return '-';
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateWithTime = (dateValue, timeValue) => {
  const dateText = formatDateLong(dateValue);
  if (!timeValue) return dateText;
  return `${dateText} ${timeValue}`;
};

const dateValue = (value) => {
  if (!value) return 0;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return 0;
  return parsed.getTime();
};

function App() {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => toInputDate(new Date()));
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_OPTIONS[0]);
  const [history, setHistory] = useState([]);
  const [historyState, setHistoryState] = useState({ loading: false, error: '' });
  const [historyView, setHistoryView] = useState('today');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const todayKey = useMemo(() => toInputDate(new Date()), []);

  const checkStatus = async () => {
    setCheckingStatus(true);
    try {
      const response = await fetch(SCRIPT_URL);
      const result = await response.json();
      setTodayStatus(result);
    } catch (err) {
      console.error('Gagal cek status', err);
      setTodayStatus({ hasInput: false });
    } finally {
      setCheckingStatus(false);
    }
  };

  const refreshHistory = async () => {
    setHistoryState({ loading: true, error: '' });
    try {
      const response = await fetch(`${SCRIPT_URL}?action=history`);
      const result = await response.json();
      const parsed = parseHistory(result);
      parsed.sort((a, b) => dateValue(b.date) - dateValue(a.date));
      setHistory(parsed);
    } catch (err) {
      console.error('Gagal mengambil riwayat', err);
      setHistoryState({ loading: false, error: 'Riwayat belum bisa dimuat.' });
      return;
    }
    setHistoryState({ loading: false, error: '' });
  };

  useEffect(() => {
    checkStatus();
    refreshHistory();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const selectedEntry = useMemo(
    () => history.find((entry) => entry.date === selectedDate) || null,
    [history, selectedDate]
  );

  useEffect(() => {
    if (selectedEntry && !isEditing) {
      setSelectedCategory(selectedEntry.category || CATEGORY_OPTIONS[0]);
    }
  }, [selectedEntry, isEditing]);

  const todayEntry = useMemo(() => {
    const historyToday = history.find((entry) => entry.date === todayKey);
    if (historyToday) return historyToday;
    if (todayStatus?.hasInput && Number.isFinite(todayStatus?.amount)) {
      return {
        date: todayKey,
        amount: Number(todayStatus.amount),
        category: todayStatus.category || '',
        time: todayStatus.time || '',
        row: todayStatus.row || null,
      };
    }
    return null;
  }, [history, todayStatus, todayKey]);

  const previousEntries = useMemo(
    () =>
      history.filter(
        (entry) => entry.date && entry.date < todayKey
      ),
    [history, todayKey]
  );

  const latestPrevious = previousEntries[0] || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = Number.parseInt(amount, 10);

    if (!val) {
      setStatus({ type: 'error', message: '❌ Nominal belum diisi.' });
      return;
    }

    if (val < 50000 || val > 500000) {
      setStatus({ type: 'error', message: '❌ Range harus 50rb - 500rb' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const formData = new FormData();
      formData.append('pemasukan', val);
      formData.append('tanggal', selectedDate);
      formData.append('kategori', selectedCategory);
      if (!isEditing) {
        const now = new Date();
        const jam = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
        formData.append('jam', jam);
      }
      if (isEditing && editRow) {
        formData.append('row', editRow);
      }

      await fetch(SCRIPT_URL, { method: 'POST', body: formData, mode: 'no-cors' });

      setStatus({
        type: 'success',
        message: isEditing ? '✅ Berhasil diupdate!' : '✅ Berhasil disimpan!',
      });

      setAmount('');
      setIsEditing(false);
      setEditRow(null);
      await checkStatus();
      await refreshHistory();
    } catch (err) {
      setStatus({ type: 'error', message: '❌ Terjadi kesalahan server!' });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (entry) => {
    if (!entry) return;
    setIsEditing(true);
    setAmount(String(entry.amount));
    setSelectedCategory(entry.category || CATEGORY_OPTIONS[0]);
    setSelectedDate(entry.date || toInputDate(new Date()));
    setEditRow(entry.row || null);
  };

  const exportToExcel = async () => {
    const dataSource = history.length
      ? history
      : todayEntry
        ? [todayEntry]
        : [];

    if (!dataSource.length) {
      setStatus({ type: 'error', message: '❌ Tidak ada data untuk diexport.' });
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pemasukan');

    sheet.columns = [
      { header: 'no', key: 'no', width: 6 },
      { header: 'tanggal', key: 'tanggal', width: 26 },
      { header: 'kategori', key: 'kategori', width: 20 },
      { header: 'pemasukan', key: 'pemasukan', width: 14 },
    ];

    dataSource.forEach((entry, index) => {
      sheet.addRow({
        no: index + 1,
        tanggal: formatDateWithTime(entry.date, entry.time),
        kategori: entry.category || '-',
        pemasukan: entry.amount,
      });
    });

    const border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = border;
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        if (rowNumber === 1) {
          cell.font = { bold: true };
        }
      });
    });

    sheet.getColumn(4).numFmt = '#,##0';
    sheet.getColumn(4).alignment = { horizontal: 'right', vertical: 'middle' };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `catatan-ek-${toInputDate(new Date())}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="app">
      <div className="shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Catatan Harian</p>
            <h1>CATATAN EK</h1>
            <p className="subtitle">Pantau pemasukan harian secara rapi, jelas, dan siap di-export.</p>
          </div>
          <button
            className="mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? 'Light' : 'Dark'}</span>
          </button>
        </header>

        <section className="summary">
          <div className="summary-card">
            <div>
              <p>Hari ini</p>
              <h3>{todayEntry ? rupiah.format(todayEntry.amount) : 'Belum ada'}</h3>
              <span>{todayEntry ? formatDateLong(todayEntry.date) : 'Belum input'}</span>
            </div>
            <CheckCircle size={22} />
          </div>
          <div className="summary-card">
            <div>
              <p>Sebelumnya</p>
              <h3>{latestPrevious ? rupiah.format(latestPrevious.amount) : 'Belum ada'}</h3>
              <span>{latestPrevious ? formatDateLong(latestPrevious.date) : 'Belum input'}</span>
            </div>
            <Calendar size={22} />
          </div>
        </section>

        <div className="layout">
          <div className="stack">
            <section className="card">
              <div className="card-header">
                <div>
                  <h2>Status Hari Ini</h2>
                  <p className="muted">Cek cepat pemasukan harian.</p>
                </div>
                <button className="icon-button" onClick={checkStatus} type="button">
                  <RefreshCw
                    size={18}
                    className={checkingStatus ? 'spin' : ''}
                  />
                </button>
              </div>
              {checkingStatus ? (
                <p className="muted">Mengecek...</p>
              ) : todayEntry ? (
                <div className="status-line">
                  <div>
                    <p className="status-amount">{rupiah.format(todayEntry.amount)}</p>
                    <span>{todayEntry.time ? `${todayEntry.time} WIB` : 'Sudah tercatat'}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => startEdit(todayEntry)}
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                </div>
              ) : (
                <div className="status-empty">
                  <AlertCircle size={18} />
                  Belum ada input hari ini
                </div>
              )}
            </section>

            <section className="card">
              <div className="card-header">
                <div>
                  <h2>{isEditing ? 'Edit Pemasukan' : 'Input Pemasukan'}</h2>
                  <p className="muted">Pilih tanggal sebelum menyimpan.</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="form">
                <label>
                  Tanggal Pemasukan
                  <div className="input-wrap">
                    <Calendar size={18} />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                    />
                  </div>
                </label>

                <label>
                  Jenis Pemasukan
                  <div className="input-wrap">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      required
                    >
                      {CATEGORY_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                {selectedEntry && !isEditing && (
                  <div className="inline-status">
                    <CheckCircle size={16} />
                    <span>
                      Sudah ada pemasukan {rupiah.format(selectedEntry.amount)} ({selectedEntry.category || 'Tanpa kategori'}) pada{' '}
                      {formatDateLong(selectedEntry.date)}.
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => startEdit(selectedEntry)}
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                  </div>
                )}

                <label>
                  Nominal Pemasukan
                  <div className="input-wrap">
                    <span className="prefix">Rp</span>
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="450000"
                    />
                  </div>
                  <small className="muted">Range: 50k - 500k</small>
                </label>

                <div className="button-row">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Memproses...' : isEditing ? 'Update Data' : 'Simpan Sekarang'}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setAmount('');
                        setEditRow(null);
                      }}
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
              {status.message && (
                <div className={`notice ${status.type}`}>{status.message}</div>
              )}
            </section>
          </div>

          <aside className="card history">
            <div className="card-header">
              <div>
                <h2>Riwayat Pemasukan</h2>
                <p className="muted">Menu cepat hari ini dan sebelumnya.</p>
              </div>
              <button type="button" className="btn btn-ghost" onClick={exportToExcel}>
                <Download size={16} />
                Export Excel
              </button>
            </div>

            <div className="segmented">
              <button
                type="button"
                className={historyView === 'today' ? 'active' : ''}
                onClick={() => setHistoryView('today')}
              >
                Hari ini
              </button>
              <button
                type="button"
                className={historyView === 'previous' ? 'active' : ''}
                onClick={() => setHistoryView('previous')}
              >
                Sebelumnya
              </button>
              <button
                type="button"
                className={historyView === 'all' ? 'active' : ''}
                onClick={() => setHistoryView('all')}
              >
                Semua
              </button>
            </div>

            {historyState.loading ? (
              <p className="muted">Memuat data...</p>
            ) : historyState.error ? (
              <p className="muted">{historyState.error}</p>
            ) : (
              <div className="history-list">
                {historyView === 'today' && (
                  <div className="history-item">
                    <div>
                      <p>{todayEntry ? formatDateLong(todayEntry.date) : 'Hari ini'}</p>
                      <span className="muted">
                        {todayEntry?.category || 'Tanpa kategori'} · {todayEntry?.time || 'Belum input'}
                      </span>
                    </div>
                    <strong>{todayEntry ? rupiah.format(todayEntry.amount) : '-'}</strong>
                  </div>
                )}

                {historyView === 'previous' &&
                  (previousEntries.length ? (
                    previousEntries.slice(0, 7).map((entry) => (
                      <div className="history-item" key={entry.date}>
                        <div>
                          <p>{formatDateLong(entry.date)}</p>
                          <span className="muted">
                            {entry.category || 'Tanpa kategori'} · {entry.time || '—'}
                          </span>
                        </div>
                        <strong>{rupiah.format(entry.amount)}</strong>
                      </div>
                    ))
                  ) : (
                    <div className="history-empty">Belum ada data sebelumnya.</div>
                  ))}

                {historyView === 'all' &&
                  (history.length ? (
                    history.map((entry) => (
                      <div className="history-item" key={`${entry.date}-${entry.amount}`}>
                        <div>
                          <p>{formatDateLong(entry.date)}</p>
                          <span className="muted">
                            {entry.category || 'Tanpa kategori'} · {entry.time || '—'}
                          </span>
                        </div>
                        <strong>{rupiah.format(entry.amount)}</strong>
                      </div>
                    ))
                  ) : (
                    <div className="history-empty">Belum ada data untuk ditampilkan.</div>
                  ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
