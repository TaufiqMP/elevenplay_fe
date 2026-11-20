import MyThreads from '@/components/forum/mythreads';

export const metadata = {
  title: 'Thread Saya',
  robots: { index: false, follow: false },
};

//Hanya member yang login. Pengecekan login ada di MyThreads
export default function MyThreadsPage() {
  return <MyThreads />;
}
