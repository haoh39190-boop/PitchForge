import { AppHeader } from "@/components/app-header";
import { HistoryDetailClient } from "./history-detail-client";

export default function HistoryDetailPage() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto w-[1180px] py-8">
        <HistoryDetailClient />
      </section>
    </main>
  );
}
