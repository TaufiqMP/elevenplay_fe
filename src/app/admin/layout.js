import AdminGuard from '@/components/admin/adminguard';

export default function AdminLayout({ children }) {
  return <AdminGuard>{children}</AdminGuard>;
}
