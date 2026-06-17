import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";

const capabilities = [
  "围绕车型、阶段、关注点和异议生成话术",
  "输出结构固定，方便复制到微信或电话沟通",
  "本地保存历史和收藏话术",
  "当前阶段只用 Mock / Template Provider",
];

const workflow = [
  "输入销售信息",
  "生成结构化话术",
  "保存历史记录",
  "收藏高价值话术",
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto grid w-[1180px] grid-cols-[500px_1fr] gap-12 py-14">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-signal">
            <ShieldCheck size={16} />
            Web MVP 演示版
          </div>
          <h1 className="text-6xl font-semibold leading-[1.02] text-ink">
            PitchForge
          </h1>
          <p className="mt-5 text-2xl font-medium leading-9 text-graphite">
            面向汽车销售场景的结构化话术生成工作台。
          </p>
          <p className="mt-6 max-w-[460px] text-base leading-7 text-graphite">
            第一阶段不接真实模型、不接数据库、不接登录。先把销售输入、模板生成、历史保存和收藏这条演示闭环跑通。
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              进入工作台
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/demo-cases"
              className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-5 py-3 text-sm font-semibold text-ink"
            >
              查看示例场景
            </Link>
          </div>
        </div>

        <div className="desk-grid rounded-lg border border-line bg-white p-5 shadow-panel">
          <div className="rounded-md border border-line bg-mist p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-signal">演示生成结果</p>
                <h2 className="text-xl font-semibold text-ink">
                  示例：客户觉得价格偏高
                </h2>
              </div>
              <MessageSquareText className="text-signal" size={24} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["开场回应", "我理解您会先看价格，这个阶段多比较很正常。"],
                ["需求确认", "我先确认一下您更看重预算边界，还是后续用车成本。"],
                ["价值匹配", "我们可以围绕您关注的使用场景，把配置和成本拆开看。"],
                ["下一步推进", "方便的话我帮您整理一版到店试驾沟通清单。"],
              ].map(([label, text]) => (
                <div key={label} className="rounded-md border border-line bg-white p-4">
                  <p className="mb-2 text-xs font-semibold text-cobalt">{label}</p>
                  <p className="text-sm leading-6 text-graphite">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto grid w-[1180px] grid-cols-4 divide-x divide-line">
          {workflow.map((item, index) => (
            <div key={item} className="px-6 py-8">
              <p className="mb-3 text-sm font-semibold text-signal">
                Step {index + 1}
              </p>
              <p className="text-lg font-semibold text-ink">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-[1180px] grid-cols-[360px_1fr] gap-10 py-14">
        <div>
          <ClipboardList className="mb-5 text-cobalt" size={30} />
          <h2 className="text-3xl font-semibold text-ink">MVP 范围清楚</h2>
          <p className="mt-4 text-base leading-7 text-graphite">
            先验证汽车销售话术工具的核心使用价值，再规划 Neon PostgreSQL 和账号体系。
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {capabilities.map((item) => (
            <div key={item} className="flex gap-3 rounded-md border border-line bg-white p-5">
              <CheckCircle2 className="mt-1 shrink-0 text-signal" size={18} />
              <p className="text-sm leading-6 text-graphite">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
