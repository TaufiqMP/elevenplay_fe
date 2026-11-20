import { Suspense } from "react";
import SectionHeading from "@/components/ui/sectionheading";
import AccountCard from "@/components/catalog/AccountCard";
import SkeletonCard from "@/components/catalog/SkeletonCard";
import { getAccounts } from "@/api/accounts"; // sesuaikan path file API publikmu

async function fetchAccounts() {
  try {
    const res = await getAccounts({ page: 1, limit: 6 });
    return res.data ?? [];
  } catch {
    // Kalau API down, beranda tetap tampil (section katalog menampilkan pesan kosong)
    return [];
  }
}

async function KatalogContent() {
  const accounts = await fetchAccounts();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeading
        title="E-Katalog"
        subtitle="Cari squad e-football impianmu, ready semua spesifikasi!"
      />

      {accounts.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-slate-300 p-8 text-center text-slate-600">
          Belum ada akun yang tersedia saat ini.
        </p>
      ) : (
        <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4">
          {accounts.map((item) => (
            <div key={item.id} className="flex h-[384px] w-[78%] shrink-0 snap-start sm:w-[320px]">
              <AccountCard account={item} imageClass="aspect-[2/1]" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function KatalogFallback() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeading
        title="E-Katalog"
        subtitle="Cari squad e-football impianmu, ready semua spesifikasi!"
      />

      <div
        aria-label="Memuat katalog"
        className="-mx-4 mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex h-[384px] w-[78%] shrink-0 snap-start sm:w-[320px]">
            <SkeletonCard />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function KatalogSection() {
  return (
    <Suspense fallback={<KatalogFallback />}>
      <KatalogContent />
    </Suspense>
  );
}