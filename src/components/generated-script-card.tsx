"use client";

import { useState } from "react";
import { Clipboard, Copy, FileText, Star } from "lucide-react";
import type { ScriptGenerationRecord } from "@/types/history";
import { EmptyState } from "./empty-state";

type GeneratedScriptCardProps = {
  record: ScriptGenerationRecord | null;
  onFavoriteChange?: (isFavorite: boolean) => void;
};

const sectionLabels = [
  ["opening", "开场回应"],
  ["needsConfirmation", "需求确认"],
  ["valueMatching", "价值匹配"],
  ["objectionHandling", "异议处理"],
  ["nextStep", "下一步推进"],
] as const;

export function GeneratedScriptCard({
  record,
  onFavoriteChange,
}: GeneratedScriptCardProps) {
  const [copied, setCopied] = useState(false);

  if (!record) {
    return (
      <EmptyState
        icon={FileText}
        title="还没有生成话术"
        description="填写右侧销售信息后，PitchForge 会生成一份结构化演示话术。"
      />
    );
  }

  async function copyFullScript() {
    if (!record) {
      return;
    }

    await navigator.clipboard.writeText(record.output.fullScript);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <article className="rounded-lg border border-line bg-white shadow-panel">
      <header className="flex items-start justify-between gap-6 border-b border-line p-5">
        <div>
          <div className="mb-2 inline-flex rounded-md bg-[#F0FAF7] px-2.5 py-1 text-xs font-semibold text-signal">
            演示生成结果 · {record.providerType}
          </div>
          <h2 className="text-2xl font-semibold text-ink">
            {record.input.customerName || record.input.vehicleModel}
          </h2>
          <p className="mt-2 text-sm text-graphite">
            {record.input.vehicleModel} · {record.input.customerStage} ·{" "}
            {record.input.customerFocus || "未填关注点"} · {record.input.tone}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onFavoriteChange?.(!record.isFavorite)}
            className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold ${
              record.isFavorite
                ? "border-amber bg-amber text-white"
                : "border-line bg-white text-graphite hover:bg-mist"
            }`}
          >
            <Star size={15} className={record.isFavorite ? "fill-white" : ""} />
            {record.isFavorite ? "已收藏" : "收藏"}
          </button>
          <button
            type="button"
            onClick={copyFullScript}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-graphite hover:bg-mist"
          >
            <Copy size={15} />
            {copied ? "已复制" : "复制"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 p-5">
        {sectionLabels.map(([key, label]) => (
          <section key={key} className="rounded-md border border-line bg-mist p-4">
            <p className="mb-2 text-xs font-semibold text-cobalt">{label}</p>
            <p className="text-sm leading-6 text-graphite">{record.output[key]}</p>
          </section>
        ))}
      </div>

      <section className="border-t border-line p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <Clipboard size={16} />
          可复制完整话术
        </div>
        <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-[#F8FAFC] p-4 text-sm leading-7 text-graphite">
          {record.output.fullScript}
        </pre>
      </section>

      <footer className="border-t border-line p-5">
        <p className="text-sm leading-6 text-graphite">
          {record.output.salesReminder}
        </p>
      </footer>
    </article>
  );
}
