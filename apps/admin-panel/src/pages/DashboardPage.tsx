
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivity from '@/components/dashboard/RecentActivity';

export default function DashboardPage() {
  return (
    <div className="tw-space-y-6">
      <h1 className="tw-text-2xl tw-font-bold tw-mb-4">Dashboard</h1>

      {/* Stats Section */}
      <DashboardStats />

      {/* Recent Activity Section */}
      <RecentActivity />
    </div>
  );
}