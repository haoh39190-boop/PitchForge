"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock3, Sparkles } from "lucide-react";
import { GeneratedScriptCard } from "@/components/generated-script-card";
import { HistoryList } from "@/components/history-list";
import { SalesScriptForm } from "@/components/sales-script-form";
import { findDemoCase } from "@/lib/demo-cases";
import {
  generateScriptRecord,
  getHistoryRecords,
  setFavorite,
} from "@/lib/history-store";
import type { SalesScriptInput } from "@/lib/model-provider";
import type { ScriptGenerationRecord } from "@/types/history";

const emptyInput: SalesScriptInput = {
  customerName: "",
  vehicleModel: "",
  budget: "",
  customerStage: "首次咨询",
  customerFocus: "价格",
  customerObjection: "还要对比",
  tone: "专业",
  customInfo: "",
};

export function DashboardClient() {
  const searchParams = useSearchParams();
  const demoCaseId = searchParams.get("case");
  const demoCase = useMemo(() => findDemoCase(demoCaseId), [demoCaseId]);
  const [input, setInput] = useState<SalesScriptInput>(emptyInput);
  const [history, setHistory] = useState<ScriptGenerationRecord[]>([]);
  const [currentRecord, setCurrentRecord] =
    useState<ScriptGenerationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        const records = await getHistoryRecords();

        if (!active) {
          return;
        }

        setHistory(records);
        setCurrentRecord(records[0] || null);
      } catch {
        if (active) {
          setError("历史记录读取失败，请稍后刷新页面。");
        }
      }
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (demoCase) {
      setInput(demoCase.input);
    }
  }, [demoCase]);

  async function handleGenerate() {
    setError(null);

    if (!input.vehicleModel.trim()) {
      setError("请填写车型名称。");
      return;
    }

    setIsLoading(true);

    try {
      const record = await generateScriptRecord(input);
      const records = await getHistoryRecords();
      setHistory(records);
      setCurrentRecord(record);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "生成接口暂时不可用，请稍后重试。"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFavoriteChange(isFavorite: boolean) {
    if (!currentRecord) {
      return;
    }

    try {
      const updated = await setFavorite(currentRecord.id, isFavorite);
      setCurrentRecord(updated);
      setHistory((records) =>
        records.map((record) => (record.id === updated.id ? updated : record))
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "收藏状态更新失败，请稍后重试。"
      );
    }
  }

  return (
    <div className="mx-auto grid h-[calc(100vh-64px)] w-[1180px] grid-cols-[280px_1fr_360px] gap-4 py-4">
      <aside className="overflow-hidden rounded-lg border border-line bg-white">
        <div className="border-b border-line p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-signal">
            <Clock3 size={14} />
            Neon 历史
          </div>
          <h2 className="mt-1 text-xl font-semibold text-ink">最近生成</h2>
        </div>
        <div className="h-[calc(100%-82px)] overflow-y-auto p-4">
          <HistoryList records={history.slice(0, 8)} activeId={currentRecord?.id} compact />
        </div>
      </aside>

      <section className="overflow-y-auto">
        {demoCase ? (
          <div className="mb-4 rounded-lg border border-line bg-white p-4">
            <p className="text-xs font-semibold text-signal">已载入示例</p>
            <div className="mt-1 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-ink">{demoCase.title}</h1>
                <p className="mt-1 text-sm text-graphite">{demoCase.scene}</p>
              </div>
              <Link
                href="/demo-cases"
                className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-mist"
              >
                更多示例
              </Link>
            </div>
          </div>
        ) : null}

        <GeneratedScriptCard
          record={currentRecord}
          onFavoriteChange={handleFavoriteChange}
        />
      </section>

      <aside className="overflow-hidden rounded-lg border border-line bg-white">
        <SalesScriptForm
          value={input}
          isLoading={isLoading}
          error={error}
          onChange={setInput}
          onSubmit={handleGenerate}
        />
        <div className="border-t border-line bg-mist p-4">
          <Link
            href="/demo-cases"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-white"
          >
            <Sparkles size={16} />
            使用示例场景
          </Link>
        </div>
      </aside>
    </div>
  );
}
