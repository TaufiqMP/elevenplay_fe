'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getAccounts } from '@/api/accounts';
import AccountCard from './AccountCard';
import SkeletonCard from './SkeletonCard';

export default function CatalogView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Ambil nomor halaman dari URL query (?page=1) sebagai single source of truth
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = pageParam > 0 ? pageParam : 1;

  const [accounts, setAccounts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');

  // Ambil data akun dari API target
  const loadData = useCallback(async (pageToLoad) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAccounts({ page: pageToLoad, limit: 12 });
      setAccounts(response?.data || []);
      setMeta(
        response?.meta || {
          page: pageToLoad,
          limit: 12,
          total: response?.data ? response.data.length : 0,
          total_pages: 1,
        }
      );
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(
        err.message || 'Gagal memuat katalog akun. Pastikan server backend sedang aktif.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Efek memuat data saat halaman berganti
  useEffect(() => {
    let ignore = false;

    getAccounts({ page: currentPage, limit: 12 })
      .then((response) => {
        if (!ignore) {
          setAccounts(response?.data || []);
          setMeta(
            response?.meta || {
              page: currentPage,
              limit: 12,
              total: response?.data ? response.data.length : 0,
              total_pages: 1,
            }
          );
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Error fetching accounts:', err);
          setError(
            err.message || 'Gagal memuat katalog akun. Pastikan server backend sedang aktif.'
          );
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentPage]);

  // Handle ganti halaman
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (meta.total_pages || 1) || newPage === currentPage) return;
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Client-side filtering & sorting pada halaman aktif
  const filteredAccounts = useMemo(() => {
    let result = [...accounts];

    // Filter berdasarkan query teks (judul, subtitle, atau kode)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (acc) =>
          acc.title?.toLowerCase().includes(q) ||
          acc.subtitle?.toLowerCase().includes(q) ||
          acc.code?.toLowerCase().includes(q) ||
          acc.tier_label?.toLowerCase().includes(q)
      );
    }

    // Filter berdasarkan Tier
    if (selectedTier !== 'ALL') {
      result = result.filter(
        (acc) => acc.tier_label?.toLowerCase() === selectedTier.toLowerCase()
      );
    }

    // Pengurutan (Sorting)
    if (sortBy === 'TITLE_ASC') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'TITLE_DESC') {
      result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    }

    return result;
  }, [accounts, searchQuery, selectedTier, sortBy]);

  // Daftar opsi Tier yang tersedia secara dinamis
  const availableTiers = useMemo(() => {
    const set = new Set();
    accounts.forEach((acc) => {
      if (acc.tier_label) set.add(acc.tier_label);
    });
    return Array.from(set);
  }, [accounts]);

  // Reset filter
  const handleResetFilter = () => {
    setSearchQuery('');
    setSelectedTier('ALL');
    setSortBy('DEFAULT');
  };

  // Generate pagination items
  const renderPaginationButtons = () => {
    const totalPages = meta.total_pages || 1;
    if (totalPages <= 1) return null;

    const buttons = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Tombol Previous (<)
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border transition-colors ${
          currentPage === 1
            ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
            : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100 hover:border-slate-300'
        }`}
        aria-label="Halaman Sebelumnya"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    );

    // Halaman Pertama jika terpotong
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border transition-colors ${
            currentPage === 1
              ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
              : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100'
          }`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots-start" className="w-8 flex items-center justify-center text-slate-400 font-bold">
            ...
          </span>
        );
      }
    }

    // Halaman di tengah
    for (let p = startPage; p <= endPage; p++) {
      const isActive = p === currentPage;
      buttons.push(
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border transition-all duration-200 ${
            isActive
              ? 'bg-orange-500 border-orange-500 text-white shadow-md scale-105'
              : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          {p}
        </button>
      );
    }

    // Halaman Terakhir jika terpotong
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots-end" className="w-8 flex items-center justify-center text-slate-400 font-bold">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border transition-colors ${
            currentPage === totalPages
              ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
              : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    // Tombol Next (>)
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border transition-colors ${
          currentPage === totalPages
            ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
            : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100 hover:border-slate-300'
        }`}
        aria-label="Halaman Berikutnya"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );

    return buttons;
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-12">
      {/* 1. Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          E-Katalog
        </h1>
        <p className="mt-2 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
          Cari squad e-football impianmu, ready semua spesifikasi!
        </p>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-card">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Input Pencarian */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama squad, pemain, atau kode akun..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-3">
            {/* Filter Tier */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full sm:w-44 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer shadow-sm"
            >
              <option value="ALL">Semua Tier</option>
              {availableTiers.length > 0 ? (
                availableTiers.map((t) => (
                  <option key={t} value={t}>
                    Tier: {t}
                  </option>
                ))
              ) : (
                <>
                  <option value="Sultan">Tier: Sultan</option>
                  <option value="Endgame">Tier: Endgame</option>
                  <option value="Mid-tier">Tier: Mid-tier</option>
                  <option value="Starter">Tier: Starter</option>
                </>
              )}
            </select>

            {/* Filter Pengurutan */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-40 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer shadow-sm"
            >
              <option value="DEFAULT">Urutkan: Terbaru</option>
              <option value="TITLE_ASC">Nama (A - Z)</option>
              <option value="TITLE_DESC">Nama (Z - A)</option>
            </select>
          </div>
        </div>

        {/* Info Filter Aktif & Reset */}
        {(searchQuery || selectedTier !== 'ALL' || sortBy !== 'DEFAULT') && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan <strong>{filteredAccounts.length}</strong> akun hasil filter pada halaman {currentPage}
            </span>
            <button
              onClick={handleResetFilter}
              className="text-orange-600 hover:text-orange-700 font-semibold underline focus:outline-none"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* 3. Main Content Area */}
      {/* KONDISI 1: LOADING */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 wide:grid-cols-4 gap-6 sm:gap-7">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}

      {/* KONDISI 2: ERROR */}
      {!loading && error && (
        <div className="bg-white rounded-2xl border border-red-200/80 p-8 sm:p-12 text-center shadow-card max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Gagal Menghubungkan ke Backend</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4 max-w-md mx-auto">
            {error}
          </p>
          <div className="bg-slate-50 rounded-xl p-3.5 mb-6 text-xs text-slate-600 text-left border border-slate-200">
            <p className="font-semibold text-slate-700 mb-1">Catatan Konfigurasi:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li>Pastikan backend Express berjalan di port <code>3000</code>.</li>
              <li>Pastikan kredensial Supabase di file <code>.env</code> backend telah diisi.</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              loadData(currentPage);
            }}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* KONDISI 3: EMPTY (TIDAK ADA DATA) */}
      {!loading && !error && filteredAccounts.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-card max-w-lg mx-auto my-8">
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Katalog Akun Belum Tersedia</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {searchQuery || selectedTier !== 'ALL'
              ? `Tidak ada akun pada halaman ${currentPage} yang sesuai dengan kata kunci pencarian atau filter yang dipilih.`
              : 'Belum ada akun eFootball yang dipublikasikan saat ini. Silakan periksa kembali nanti.'}
          </p>
          {(searchQuery || selectedTier !== 'ALL' || sortBy !== 'DEFAULT') && (
            <button
              onClick={handleResetFilter}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      )}

      {/* KONDISI 4: SUCCESS (DAFTAR KARTU AKUN) */}
      {!loading && !error && filteredAccounts.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 wide:grid-cols-4 gap-6 sm:gap-7">
            {filteredAccounts.map((account) => (
              <AccountCard key={account.id || account.code} account={account} />
            ))}
          </div>

          {/* 4. Pagination */}
          <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
            {renderPaginationButtons()}
          </div>
        </>
      )}
    </div>
  );
}
