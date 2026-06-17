"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Star } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { HistoryList } from "@/components/history-list";
import { getHistoryRecords } from "@/lib/history-store";
import type { ScriptGenerationRecord } from "@/types/history";

export function FavoritesClient() {
  const [records, setRecords] = useState<ScriptGenerationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadFavorites() {
      try {
        const nextRecords = await getHistoryRecords({ favoritesOnly: true });

        if (active) {
          setRecords(nextRecords);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "收藏话术读取失败，请稍后重试。"
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-line bg-white p-5 text-sm text-graphite shadow-panel">
        正在读取收藏话术...
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Star}
        title="收藏话术读取失败"
        description={error}
        action={
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white"
          >
            <PlusCircle size={16} />
            去生成话术
          </Link>
        }
      />
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="暂无收藏话术"
        description="在生成结果页点击收藏后，高价值话术会保存到 Neon 并集中显示在这里。"
        action={
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white"
          >
            <PlusCircle size={16} />
            去生成话术
          </Link>
        }
      />
    );
  }

  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <HistoryList records={records} />
    </div>
  );
}
