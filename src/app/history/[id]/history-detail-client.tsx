"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileX2, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { GeneratedScriptCard } from "@/components/generated-script-card";
import {
  deleteHistoryRecord,
  getHistoryRecord,
  setFavorite,
} from "@/lib/history-store";
import type { ScriptGenerationRecord } from "@/types/history";

export function HistoryDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<ScriptGenerationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRecord() {
      try {
        const nextRecord = await getHistoryRecord(params.id);

        if (active) {
          setRecord(nextRecord);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "历史详情读取失败，请稍后重试。"
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadRecord();

    return () => {
      active = false;
    };
  }, [params.id]);

  async function handleFavoriteChange(isFavorite: boolean) {
    try {
      const updated = await setFavorite(params.id, isFavorite);
      setRecord(updated);
    } catch (favoriteError) {
      setError(
        favoriteError instanceof Error
          ? favoriteError.message
          : "收藏状态更新失败，请稍后重试。"
      );
    }
  }

  async function handleDelete() {
    try {
      await deleteHistoryRecord(params.id);
      router.push("/history");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "历史记录删除失败，请稍后重试。"
      );
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-line bg-white p-5 text-sm text-graphite shadow-panel">
        正在读取历史详情...
      </div>
    );
  }

  if (!record) {
    return (
      <EmptyState
        icon={FileX2}
        title="没有找到这条记录"
        description={error || "这条历史记录可能已经被删除。"}
        action={
          <Link
            href="/dashboard"
            className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white"
          >
            进入工作台
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-md border border-amber bg-[#FFF7ED] px-4 py-3 text-sm text-amber">
          {error}
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-mist"
        >
          <ArrowLeft size={15} />
          返回历史
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-amber hover:bg-[#FFF7ED]"
        >
          <Trash2 size={15} />
          删除
        </button>
      </div>
      <GeneratedScriptCard
        record={record}
        onFavoriteChange={handleFavoriteChange}
      />
    </div>
  );
}
