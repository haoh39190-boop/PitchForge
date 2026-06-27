'use client';

import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/core/i18n/navigation';
import { LocaleSelector, ThemeToggler } from '@/shared/blocks/common';
import { cn } from '@/shared/lib/utils';

export function ProductShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('pitchforge');
  const pathname = usePathname();

  const nav = [
    {
      label: t('nav.customers'),
      href: '/customers',
      active: pathname.startsWith('/customers'),
    },
    {
      label: t('nav.savedScripts'),
      href: '/saved-scripts',
      active: pathname.startsWith('/saved-scripts'),
    },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="border-border/70 bg-background/92 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1390px] items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                <Sparkles className="size-4" />
              </span>
              <span className="text-[17px] font-semibold tracking-[-0.02em]">
                {t('brand')}
              </span>
            </Link>

            <nav className="flex h-16 items-center gap-7">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex h-full items-center text-sm font-medium transition-colors',
                    item.active
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.label}
                  {item.active && (
                    <span className="bg-primary absolute inset-x-0 bottom-0 h-0.5 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <LocaleSelector type="button" />
            <span className="bg-border h-5 w-px" />
            <ThemeToggler className="text-muted-foreground hover:text-foreground" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1390px] px-6 py-9">
        {children}
      </main>
    </div>
  );
}
