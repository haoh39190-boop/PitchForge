"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileClock, PlusCircle } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { HistoryList } from "@/components/history-list";
import { getHistoryRecords } from "@/lib/history-store";
import type { ScriptGenerationRecord } from "@/types/history";

export function HistoryClient() {
  const [records, setRecords] = useState<ScriptGenerationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRecords() {
      try {
        const nextRecords = await getHistoryRecords();

        if (active) {
          setRecords(nextRecords);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "历史记录读取失败，请稍后重试。"
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadRecords();

    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-line bg-white p-5 text-sm text-graphite shadow-panel">
        正在读取历史记录...
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={FileClock}
        title="历史记录读取失败"
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
        icon={FileClock}
        title="暂无历史记录"
        description="生成第一条演示话术后，历史记录会保存到 Neon 数据库中。"
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
