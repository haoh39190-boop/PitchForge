"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Database } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "工作台" },
  { href: "/demo-cases", label: "示例场景" },
  { href: "/history", label: "历史记录" },
  { href: "/favorites", label: "收藏话术" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-[1180px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-white">
            <BarChart3 size={18} />
          </span>
          <span>
            <span className="block text-lg font-semibold leading-5 text-ink">
              PitchForge
            </span>
            <span className="block text-xs font-medium text-graphite">
              Web MVP
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-semibold ${
                  isActive
                    ? "bg-mist text-ink"
                    : "text-graphite hover:bg-mist hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-md border border-line bg-mist px-3 py-2 text-xs font-semibold text-graphite">
            <Database size={14} />
            Neon later
          </span>
        </div>
      </div>
    </header>
  );
}
