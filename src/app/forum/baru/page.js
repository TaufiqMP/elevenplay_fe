import ThreadForm from '@/components/forum/threadform';

export const metadata = {
  title: 'Buat Thread',
  robots: { index: false, follow: false },
};

//Hanya member yang login. Pengecekan login ada di ThreadForm
export default function NewThreadPage() {
  return <ThreadForm />;
}
