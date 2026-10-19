'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { supabase } from '@/supabase';

const baseNavLinks = [
  { name: 'Beranda', path: '/' },
  { name: 'E-Katalog', path: '/katalog' },
  { name: 'Forum', path: '#' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const navLinks =
    user?.app_metadata?.role === 'admin'
      ? [...baseNavLinks, { name: 'Admin', path: '/admin' }]
      : baseNavLinks;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Gagal logout:', err);
    }
  };

  const isCurrentActive = (path, name) => {
    if (name === 'E-Katalog') {
      return pathname === path || pathname.startsWith(`${path}/`);
    }
    if (name === 'Admin') {
      return pathname === path || pathname.startsWith(`${path}/`);
    }
    return pathname === path;
  };

  const displayName =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Member';

  return (
    <header className="sticky top-0 z-40 bg-[#FF7F00] text-white shadow-md">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {/* Baris 1: logo di kiri, nama brand di tengah */}
        <div className="relative flex h-20 items-center justify-center">
          <Link
            href="/"
            aria-label="Elevenplay, ke beranda"
            className="absolute left-0 top-1/2 -translate-y-1/2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <Image
              src="/logo-elevenplay.png"
              alt="Elevenplay Logo"
              width={64}
              height={64}
              priority
              className="h-14 w-14 object-contain sm:h-16 sm:w-16"
            />
          </Link>

          {/* Desktop account actions */}
          <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 items-center md:flex">
            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/15 px-3.5 py-1.5 rounded-lg border border-white/20 text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold text-white max-w-[130px] truncate" title={displayName}>
                    {displayName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white/90 hover:text-white hover:bg-white/15 border border-white/20 transition-all"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white hover:bg-white/10 transition-all border border-white/30"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-white text-orange-600 hover:bg-orange-50 transition-all shadow-sm"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Tombol hamburger (mobile) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-lg p-2 hover:bg-white/10 focus:outline-none md:hidden"
            aria-label="Buka menu navigasi"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {/* Baris 2: menu (desktop) */}
        <nav className="hidden h-12 items-center gap-10 md:flex lg:gap-16" aria-label="Menu utama">
          {navLinks.map((link) => {
            const active = isCurrentActive(link.path, link.name);
            return (
              <Link
                key={link.name}
                href={link.path}
                aria-current={active ? 'page' : undefined}
                className={`border-b-2 py-1 text-lg transition-all duration-300 ${
                  active
                    ? 'border-white font-bold'
                    : 'border-transparent text-white/90 hover:border-white/60 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Menu dropdown (mobile) */}
      {mobileMenuOpen && (
        <div className="border-t border-white/25 bg-[#FF7F00] px-4 py-4 shadow-inner sm:px-6 md:hidden">
          <nav className="grid gap-1" aria-label="Menu utama">
            {navLinks.map((link) => {
              const active = isCurrentActive(link.path, link.name);
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-11 items-center rounded-lg px-4 text-base transition-colors ${
                    active
                      ? 'bg-white font-bold text-orange-600 shadow-sm'
                      : 'font-semibold text-white/95 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-white/25 pt-4">
            {user ? (
              <div className="grid gap-3">
                <div className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-300"></span>
                  <span className="min-w-0 truncate">
                    Login sebagai: <strong className="text-white">{displayName}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex min-h-11 w-full items-center justify-center rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-11 items-center justify-center rounded-lg border border-white/35 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-11 items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-orange-600 shadow-sm transition-colors hover:bg-orange-50"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
