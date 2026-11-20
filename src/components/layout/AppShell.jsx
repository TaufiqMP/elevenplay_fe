'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

//Navbar sementara saat halaman masih dimuat, supaya header tidak hilang
function NavbarFallback() {
  return (
    <header className="sticky top-0 z-40 bg-[#FF7F00] text-white shadow-md" aria-hidden="true">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <Image
          src="/logo-elevenplay.png"
          alt=""
          width={64}
          height={64}
          className="h-14 w-14 object-contain sm:h-16 sm:w-16"
        />
      </div>
    </header>
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
    <Suspense fallback={<><NavbarFallback /><main className="flex-1">{children}</main></>}>
      <ShellContent>{children}</ShellContent>
    </Suspense>
  );
}

