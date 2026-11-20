'use client';

import ReactMarkdown from 'react-markdown';

//Isi thread dalam Markdown. HTML mentah di dalam isi tidak ditampilkan (aman dari script)
export default function Markdown({ children }) {
  return (
    <div className="space-y-4 text-base leading-relaxed sm:text-lg text-slate-800 [&_a]:font-semibold [&_a]:text-orange-600 [&_a]:underline [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_img]:my-4 [&_img]:max-h-[420px] [&_img]:max-w-full [&_img]:rounded-xl [&_img]:object-contain [&_li]:ml-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-6">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
