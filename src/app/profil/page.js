import ProfileSettings from '@/components/profile/profilesettings';

export const metadata = {
  title: 'Pengaturan Profil',
  robots: { index: false, follow: false },
};

//Hanya member yang login. Pengecekan login ada di ProfileSettings
export default function ProfilePage() {
  return <ProfileSettings />;
}
