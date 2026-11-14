import AdminReportsList from "@/components/dashboard/AdminReportsList";
import { getAdminReports, getAdminLogs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [reports, logs] = await Promise.all([getAdminReports(), getAdminLogs()]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Reports</h1>
      <p className="mb-6 text-sm text-gray-500">See who reported which shop</p>
      <AdminReportsList reports={reports} logs={logs} />
    </div>
  );
}