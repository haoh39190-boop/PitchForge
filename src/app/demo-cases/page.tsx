import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { demoCases } from "@/lib/demo-cases";

export default function DemoCasesPage() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto w-[1180px] py-8">
        <div className="mb-8 flex items-end justify-between gap-8">
          <div>
            <p className="text-xs font-semibold text-signal">示例数据</p>
            <h1 className="mt-1 text-3xl font-semibold text-ink">演示场景</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite">
              以下内容均为示例，用于展示话术生成流程，不代表真实车型、价格、优惠或库存信息。
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-mist"
          >
            空白输入
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {demoCases.map((demoCase) => (
            <article key={demoCase.id} className="rounded-lg border border-line bg-white p-5 shadow-panel">
              <div className="mb-5 flex items-start justify-between gap-5">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-mist px-2.5 py-1 text-xs font-semibold text-cobalt">
                    <ClipboardList size={14} />
                    示例
                  </div>
                  <h2 className="text-xl font-semibold text-ink">{demoCase.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-graphite">{demoCase.scene}</p>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-y border-line py-4 text-sm">
                <div>
                  <dt className="font-semibold text-ink">车型</dt>
                  <dd className="mt-1 text-graphite">{demoCase.input.vehicleModel}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">阶段</dt>
                  <dd className="mt-1 text-graphite">{demoCase.input.customerStage}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">关注点</dt>
                  <dd className="mt-1 text-graphite">{demoCase.input.customerFocus}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">异议</dt>
                  <dd className="mt-1 text-graphite">{demoCase.input.customerObjection}</dd>
                </div>
              </dl>

              <Link
                href={`/dashboard?case=${demoCase.id}`}
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white"
              >
                带入工作台
                <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
