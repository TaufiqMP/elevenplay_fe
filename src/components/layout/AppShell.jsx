'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

function NavbarFallback() {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-md h-20" />
  );
}

function ShellContent({ children }) {
  const pathname = usePathname();

  // Daftar rute autentikasi yang menggunakan layout khusus tanpa Navbar & Footer publik
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    (pathname && pathname.startsWith('/verifikasi'));

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

export default function AppShell({ children }) {
  return (
    <Suspense fallback={<main className="flex-1">{children}</main>}>
      <ShellContent>{children}</ShellContent>
    </Suspense>
  );
}

