'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { supabase } from '@/supabase';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

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

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'E-Katalog', path: '/' },
    { name: 'Forum', path: '#' },
  ];

  const isCurrentActive = (path, name) => {
    if (name === 'E-Katalog') {
      return pathname === '/' || (pathname && pathname.startsWith('/katalog'));
    }
    return false;
  };

  const displayName =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Member';

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-md">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group focus:outline-none">
              {/* Eagle Wing Emblem Image */}
              <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform relative">
                <Image
                  src="/logo-elevenplay.png"
                  alt="Elevenplay Logo"
                  width={48}
                  height={48}
                  priority
                  className="w-full h-full object-contain drop-shadow filter brightness-105"
                />
              </div>

              {/* Brand Typography */}
              <div className="flex flex-col">
                <span className="text-2xl font-black italic tracking-wider text-white drop-shadow-sm font-sans">
                  ELEVENPLAY
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-orange-100 -mt-1 opacity-90">
                  eFootball Hub Indonesia
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-5">
            <nav className="flex items-center gap-2">
              {navLinks.map((link) => {
                const active = isCurrentActive(link.path, link.name);
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-white text-orange-600 shadow-sm font-bold'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="h-6 w-px bg-white/25" />

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

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-orange-400/40 bg-orange-600 px-4 pt-3 pb-4 space-y-2 shadow-inner">
          {navLinks.map((link) => {
            const active = isCurrentActive(link.path, link.name);
            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  active
                    ? 'bg-white text-orange-600 font-bold shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-orange-400/40">
            {user ? (
              <div className="space-y-2">
                <div className="px-4 py-2 text-sm text-orange-100 flex items-center gap-2 bg-orange-700/30 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="truncate">
                    Login sebagai: <strong className="text-white">{displayName}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-lg text-sm font-bold text-white border border-white/40 hover:bg-white/10 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-lg text-sm font-bold bg-white text-orange-600 hover:bg-orange-50 transition-colors shadow-sm"
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

