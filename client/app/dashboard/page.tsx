export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="text-sm font-medium">Total Students</div>
          <div className="text-2xl font-bold">1,234</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="text-sm font-medium">Total Teachers</div>
          <div className="text-2xl font-bold">56</div>
        </div>
        {/* More cards */}
      </div>
    </div>
  );
}
