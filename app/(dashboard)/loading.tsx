export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 space-y-3">
        <div className="h-8 w-52 rounded-xl bg-card animate-pulse" />
        <div className="h-4 w-80 max-w-full rounded-lg bg-card animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-card animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
