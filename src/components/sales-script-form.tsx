"use client";

import { Loader2, Wand2 } from "lucide-react";
import type { SalesScriptInput } from "@/lib/model-provider";

const stageOptions = ["首次咨询", "对比竞品", "邀约到店", "价格谈判", "临门一脚"];
const focusOptions = ["价格", "空间", "油耗", "配置", "保值率", "金融方案", "交付周期"];
const objectionOptions = ["太贵", "还要对比", "家人不同意", "担心贷款压力", "暂时不急"];
const toneOptions = ["专业", "亲和", "强转化", "克制稳重"];

type SalesScriptFormProps = {
  value: SalesScriptInput;
  isLoading: boolean;
  error: string | null;
  onChange: (value: SalesScriptInput) => void;
  onSubmit: () => void;
};

export function SalesScriptForm({
  value,
  isLoading,
  error,
  onChange,
  onSubmit,
}: SalesScriptFormProps) {
  function updateField(field: keyof SalesScriptInput, fieldValue: string) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  return (
    <form
      className="flex h-full flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="border-b border-line p-5">
        <p className="text-xs font-semibold text-signal">销售输入</p>
        <h2 className="mt-1 text-xl font-semibold text-ink">生成话术</h2>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">
            客户姓名/称呼
          </span>
          <input
            value={value.customerName || ""}
            onChange={(event) => updateField("customerName", event.target.value)}
            placeholder="示例：张先生"
            className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">车型名称</span>
          <input
            value={value.vehicleModel}
            onChange={(event) => updateField("vehicleModel", event.target.value)}
            placeholder="示例：某新能源 SUV"
            className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">客户预算</span>
          <input
            value={value.budget || ""}
            onChange={(event) => updateField("budget", event.target.value)}
            placeholder="示例：20 万以内"
            className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">客户阶段</span>
          <select
            value={value.customerStage}
            onChange={(event) => updateField("customerStage", event.target.value)}
            className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink"
          >
            {stageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">客户关注点</span>
          <select
            value={value.customerFocus || ""}
            onChange={(event) => updateField("customerFocus", event.target.value)}
            className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink"
          >
            <option value="">暂不确定</option>
            {focusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">客户异议</span>
          <select
            value={value.customerObjection || ""}
            onChange={(event) => updateField("customerObjection", event.target.value)}
            className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink"
          >
            <option value="">暂不确定</option>
            {objectionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">语气风格</span>
          <select
            value={value.tone}
            onChange={(event) => updateField("tone", event.target.value)}
            className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink"
          >
            {toneOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">其他补充</span>
          <textarea
            value={value.customInfo || ""}
            onChange={(event) => updateField("customInfo", event.target.value)}
            placeholder="示例：客户上次对比过竞品，家人更关心后排空间，周末可能到店。"
            rows={4}
            className="min-h-28 w-full resize-none rounded-md border border-line bg-white px-3 py-3 text-sm leading-6 text-ink"
          />
        </label>

        {error ? (
          <div className="rounded-md border border-amber bg-[#FFF7ED] p-3 text-sm leading-6 text-amber">
            {error}
          </div>
        ) : null}
      </div>

      <div className="border-t border-line p-5">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
          {isLoading ? "生成中" : "生成话术"}
        </button>
      </div>
    </form>
  );
}
