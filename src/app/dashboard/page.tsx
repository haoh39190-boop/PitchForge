import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { DashboardClient } from "./dashboard-client";

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <Suspense fallback={<DashboardFallback />}>
        <DashboardClient />
      </Suspense>
    </main>
  );
}

function DashboardFallback() {
  return (
    <div className="mx-auto grid h-[calc(100vh-64px)] w-[1180px] grid-cols-[280px_1fr_360px] gap-4 py-4">
      <div className="rounded-lg border border-line bg-white" />
      <div className="rounded-lg border border-line bg-white" />
      <div className="rounded-lg border border-line bg-white" />
    </div>
  );
}
