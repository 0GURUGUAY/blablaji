"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type StaticRedirectPageProps = {
  href: string;
  label: string;
};

export function StaticRedirectPage({ href, label }: StaticRedirectPageProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--uy-paper)] px-6 text-center">
      <div className="max-w-lg space-y-4 rounded-[28px] border border-[var(--uy-line)] bg-white p-8 shadow-[0_20px_60px_-45px_rgba(19,89,135,0.35)]">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--uy-deep)]">BlablaJI</p>
        <h1 className="font-serif text-3xl text-slate-900">Redirection...</h1>
        <p className="text-sm leading-6 text-slate-600">
          Si la redirection ne se fait pas automatiquement, ouvre la page suivante.
        </p>
        <Link href={href} className="inline-flex rounded-full bg-[var(--uy-deep)] px-5 py-3 text-sm font-semibold text-[var(--uy-paper)]">
          {label}
        </Link>
      </div>
    </main>
  );
}