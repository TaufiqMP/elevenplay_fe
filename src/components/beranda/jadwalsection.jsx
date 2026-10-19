import { GamepadIcon, TiktokIcon } from "@/components/ui/icons";

// Data jadwal dikirim lewat prop, karena nanti diatur admin lewat backend.
// Bentuk data: [{ id, title, time }]
// Sementara kosong, section menampilkan pesan "belum ada jadwal".
export default function JadwalSection({ jadwal = [] }) {
  const [utama, ...lainnya] = jadwal;

  return (
    <section className="bg-gradient-to-b from-neutral-800 to-black py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="flex items-center gap-3 text-3xl font-extrabold text-white sm:text-4xl">
          <TiktokIcon />
          Jadwal Room Match &amp; Live Tiktok
        </h2>

        {!utama ? (
          <p className="mt-8 rounded-sm border border-dashed border-neutral-600 p-8 text-center text-neutral-300">
            Belum ada jadwal terbaru.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {/* Kartu utama */}
            <div
              className={`flex items-center gap-5 rounded-sm bg-white p-8 ${
                lainnya.length > 0 ? "lg:col-span-3 lg:row-span-2" : "lg:col-span-5"
              }`}
            >
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded bg-neutral-900 text-white">
                <GamepadIcon className="h-10 w-10" />
              </span>
              <div>
                <h3 className="text-2xl font-semibold text-slate-900">{utama.title}</h3>
                <p className="mt-2 text-slate-600">{utama.time}</p>
              </div>
            </div>

            {/* Kartu samping */}
            {lainnya.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-sm bg-white p-5 lg:col-span-2"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded bg-neutral-900 text-white">
                  <GamepadIcon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-600">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}