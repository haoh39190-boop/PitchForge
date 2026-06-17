"use client";

import Link from "next/link";
import { Clock3, Star } from "lucide-react";
import type { ScriptGenerationRecord } from "@/types/history";

type HistoryListProps = {
  records: ScriptGenerationRecord[];
  activeId?: string;
  compact?: boolean;
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "刚刚";
  }
}

export function HistoryList({ records, activeId, compact }: HistoryListProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line bg-white p-5 text-sm leading-6 text-graphite">
        暂无历史记录。生成一条话术后会保存到 Neon 并显示在这里。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {records.map((record) => {
        const title = record.input.customerName || record.input.vehicleModel;
        const detail = record.input.customerName
          ? `${record.input.vehicleModel} · ${record.input.customerStage}`
          : record.input.customerStage;

        return (
          <Link
            key={record.id}
            href={`/history/${record.id}`}
            className={`rounded-md border p-4 ${
              activeId === record.id
                ? "border-signal bg-[#F0FAF7]"
                : "border-line bg-white hover:border-cobalt"
            }`}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-ink">
                {title}
              </h3>
              {record.isFavorite ? (
                <Star className="shrink-0 fill-amber text-amber" size={15} />
              ) : null}
            </div>
            <p className="line-clamp-2 text-xs leading-5 text-graphite">
              {detail} · {record.input.customerFocus || "未填关注点"} ·{" "}
              {record.input.customerObjection || "未填异议"}
            </p>
            {!compact ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-graphite">
                <Clock3 size={13} />
                {formatDate(record.createdAt)}
              </div>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
