import Link from "next/link";
import { AppHeader } from "@/components/app-header";

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto flex w-[1180px] flex-col items-start gap-5 py-28">
        <p className="text-sm font-semibold text-signal">404</p>
        <h1 className="text-4xl font-semibold text-ink">没有找到这个页面</h1>
        <p className="max-w-xl text-base leading-7 text-graphite">
          PitchForge 当前只开放 MVP 演示页面。可以回到工作台继续生成示例话术。
        </p>
        <Link
          href="/dashboard"
          className="rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white"
        >
          进入工作台
        </Link>
      </section>
    </main>
  );
}
