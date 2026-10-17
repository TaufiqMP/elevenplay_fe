'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: 'Beranda', path: '/' },
  { name: 'E-Katalog', path: '/katalog' },
  { name: 'Forum', path: '#' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isCurrentActive = (path, name) => {
    if (name === 'E-Katalog') {
      return pathname === path || pathname.startsWith(`${path}/`);
    }
    return pathname === path;
  };

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

          <Link
            href="/"
            className="text-2xl font-medium italic tracking-wide sm:text-3xl"
          >
            ELEVENPLAY
          </Link>

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
                className={`border-b-2 py-1 text-lg transition-colors ${
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
        <div className="space-y-1 border-t border-orange-300/50 bg-[#FF7F00] px-4 pb-4 pt-3 md:hidden">
          {navLinks.map((link) => {
            const active = isCurrentActive(link.path, link.name);
            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-lg px-4 py-2.5 text-base transition-colors ${
                  active ? 'bg-white font-bold text-orange-600' : 'font-medium hover:bg-white/10'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}