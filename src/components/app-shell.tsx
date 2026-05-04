import Link from "next/link";
import type { ReactNode } from "react";
import { HeaderUserPanel } from "@/components/header-user-panel";
import { getLocalizedContent } from "@/lib/content";
import { getLocalePath, type Locale } from "@/lib/locale";

type AppShellProps = {
  children: ReactNode;
  locale: Locale;
  path: "/" | "/trips" | "/publish" | "/vehicle" | "/messages" | "/account" | "/admin" | "/welcome";
};

function UruguaySunMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-11 w-11 drop-shadow-[0_10px_18px_rgba(255,203,47,0.24)]">
      <g fill="none" fillRule="evenodd">
        <g transform="translate(32 32)">
          {[...Array.from({ length: 16 })].map((_, index) => {
            const angle = index * 22.5;
            const isLongRay = index % 2 === 0;
            return (
              <path
                key={angle}
                d={isLongRay ? "M0-25 L3.8-12.5 L-3.8-12.5 Z" : "M0-21 L2.6-12.5 L-2.6-12.5 Z"}
                fill="var(--uy-sun)"
                opacity={isLongRay ? "1" : "0.72"}
                transform={`rotate(${angle})`}
              />
            );
          })}
          <circle r="14" fill="url(#sun-core)" />
          <circle r="10.5" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="1.5" />
          <circle r="6.5" fill="none" stroke="rgba(0,63,130,0.16)" strokeWidth="1" />
        </g>
        <defs>
          <radialGradient id="sun-core" cx="35%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#fff5c2" />
            <stop offset="55%" stopColor="var(--uy-sun)" />
            <stop offset="100%" stopColor="#efb700" />
          </radialGradient>
        </defs>
      </g>
    </svg>
  );
}

export function AppShell({ children, locale, path }: AppShellProps) {
  const content = getLocalizedContent(locale);
  const navigation = [
    { href: "/", label: content.navigation.home },
    { href: "/trips", label: content.navigation.trips },
    { href: "/publish", label: content.navigation.publish },
    { href: "/messages", label: content.navigation.messages },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(247,251,253,0.82)_32%,_rgba(196,232,248,0.25)_64%,_rgba(217,181,109,0.1)_100%)] text-[var(--uy-night)]">
      <header className="sticky top-0 z-30 border-b border-[var(--uy-line)] bg-[color:rgba(255,253,250,0.84)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link href={getLocalePath(locale)} className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.98),rgba(223,244,255,0.96)_32%,rgba(102,199,255,0.28)_68%,rgba(0,91,187,0.16)_100%)] ring-1 ring-[var(--uy-line)] shadow-[0_16px_35px_-20px_rgba(0,91,187,0.42)]">
              <UruguaySunMark />
            </div>
            <div>
              <p className="font-serif text-xl font-semibold">BlablaJI</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Jose Ignacio, Uruguay</p>
            </div>
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <nav className="items-center gap-2 rounded-full border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.84)] p-1 text-sm md:flex shadow-[0_12px_30px_-24px_rgba(31,77,107,0.45)]">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={getLocalePath(locale, item.href)}
                  className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-[var(--uy-deep)] hover:text-[var(--uy-paper)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-1 rounded-full border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.84)] p-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-[0_12px_30px_-24px_rgba(31,77,107,0.45)]">
              {(["es", "fr"] as const).map((language) => (
                <Link
                  key={language}
                  href={getLocalePath(language, path)}
                  className={[
                    "rounded-full px-3 py-2 transition",
                    language === locale ? "bg-[var(--uy-deep)] text-[var(--uy-paper)]" : "text-slate-500 hover:bg-[var(--uy-sky-soft)]",
                  ].join(" ")}
                >
                  {content.languageNames[language]}
                </Link>
              ))}
            </div>
            <HeaderUserPanel locale={locale} />
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-16 px-6 py-10">{children}</div>
      <footer className="mt-6 border-t border-[var(--uy-line)] bg-[color:rgba(255,253,250,0.82)]">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-5 text-sm font-medium tracking-[0.08em] text-slate-500">
          Copyright Max Patissier 2026
        </div>
      </footer>
    </div>
  );
}