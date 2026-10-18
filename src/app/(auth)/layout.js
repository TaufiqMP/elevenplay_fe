import React from 'react';

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#ea580c] bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 py-10 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
