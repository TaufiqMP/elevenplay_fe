import { Suspense } from "react";
import { TiktokIcon } from "@/components/ui/icons";
import JadwalCard from "@/components/jadwal/jadwalcard";
import { getSchedules } from "@/api/schedules";
import { getSettings } from "@/api/settings";

// Kalau API down, beranda tetap tampil (section jadwal menampilkan pesan kosong)
async function fetchData() {
  const [schedules, settings] = await Promise.all([
    getSchedules({ limit: 3 }).then((res) => res.data ?? []).catch(() => []),
    getSettings().catch(() => null),
  ]);
  return { schedules, settings };
}

function Heading() {
  return (
    <h2 className="flex items-center gap-3 text-3xl font-extrabold text-white sm:text-4xl">
      <TiktokIcon />
      Jadwal Room Match &amp; Live Tiktok
    </h2>
  );
}

async function JadwalContent() {
  const { schedules, settings } = await fetchData();
  const [utama, ...lainnya] = schedules;

  return (
    <>
      {!utama ? (
        <p className="mt-8 rounded-sm border border-dashed border-neutral-600 p-8 text-center text-neutral-300">
          Belum ada jadwal terbaru.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-5">
          {/* Kartu utama */}
          <JadwalCard
            schedule={utama}
            settings={settings}
            big
            className={lainnya.length > 0 ? "lg:col-span-3 lg:row-span-2" : "lg:col-span-5"}
          />

          {/* Kartu samping */}
          {lainnya.map((item) => (
            <JadwalCard key={item.id} schedule={item} settings={settings} className="lg:col-span-2" />
          ))}
        </div>
      )}
    </>
  );
}

function JadwalFallback() {
  return (
    <div aria-label="Memuat jadwal" className="mt-8 grid gap-4 lg:grid-cols-5">
      <div className="h-40 skeleton-dark rounded-sm lg:col-span-3 lg:row-span-2 lg:h-auto" />
      <div className="h-24 skeleton-dark rounded-sm lg:col-span-2" />
      <div className="h-24 skeleton-dark rounded-sm lg:col-span-2" />
    </div>
  );
}

export default function JadwalSection() {
  return (
    <section className="bg-gradient-to-b from-neutral-800 to-black py-14">
      <div className="mx-auto max-w-6xl px-4">
        <Heading />
        <Suspense fallback={<JadwalFallback />}>
          <JadwalContent />
        </Suspense>
      </div>
    </section>
  );
}
