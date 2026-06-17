import { AppHeader } from "@/components/app-header";
import { HistoryClient } from "./history-client";

export default function HistoryPage() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto w-[1180px] py-8">
        <div className="mb-6">
          <p className="text-xs font-semibold text-signal">本地存储</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">历史记录</h1>
          <p className="mt-2 text-sm text-graphite">
            当前记录保存在浏览器本地，后续 Neon PostgreSQL 接入后会迁移到云端账号数据。
          </p>
        </div>
        <HistoryClient />
      </section>
    </main>
  );
}
