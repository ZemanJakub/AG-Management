// app/admin/logs/page.tsx

import LogViewer from "@/modules/admin/components/logViewer";

export const metadata = {
  title: 'Prohlížeč logů',
  description: 'Prohlížeč aplikačních logů',
};

export default function LogsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Prohlížeč logů</h1>
      <LogViewer />
    </div>
  );
}