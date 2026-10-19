import SectionHeading from "@/components/ui/sectionheading";
import AccountCard from "@/components/catalog/AccountCard";
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

export default async function KatalogSection() {
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
            <div key={item.id} className="w-[85%] shrink-0 snap-start sm:w-[360px]">
              <AccountCard account={item} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}