'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
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
        <div className="md:hidden border-t border-orange-400/40 bg-orange-600 px-4 pt-3 pb-4 space-y-1 shadow-inner">
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
        </div>
      )}
    </header>
  );
}
