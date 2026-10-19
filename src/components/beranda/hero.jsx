import Image from "next/image";
import Link from "next/link";

const btn =
  "rounded-sm border border-orange-300 bg-orange-500 px-8 py-2 text-center font-bold shadow hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-orange-500">
      <Image
        src="/hero-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />

      <div className="mx-auto flex min-h-[320px] max-w-6xl items-center justify-center px-4 py-12 sm:min-h-[420px] md:min-h-[500px]">
        {/* Wrapper relative: dipakai sebagai patokan posisi maskot */}
        <div className="relative">
          <div className="rounded-sm border border-orange-300/60 bg-orange-500/80 p-6 text-white backdrop-blur-sm sm:p-10 md:w-[700px] lg:w-[650px]">
            <h1 className="text-4xl font-extrabold italic sm:text-6xl md:text-7xl">
              Elevenplay
            </h1>
            <p className="mt-2 text-lg font-semibold italic sm:text-2xl">
              Share. Discuss. Connect.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/katalog" className={btn}>E-Katalog</Link>
              <Link href="/forum" className={btn}>Forum</Link>
            </div>
          </div>

          {/* Maskot: menempel di sisi kanan kotak, nyambung sampai dasar hero.
              Disembunyikan di layar kecil supaya tidak menutupi teks. */}
          <div className="pointer-events-none absolute -bottom-12 left-full z-10 -ml-64 mb-8 hidden h-[300px] w-[220px] md:block lg:h-[440px] lg:w-[320px]">
            <Image
              src="/mascot1.png"
              alt="Maskot Elevenplay"
              fill
              priority
              sizes="320px"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}