import { AppShell } from "@/components/app-shell";
import { ProfileSetupGate } from "@/components/profile-setup-gate";
import { SectionTitle } from "@/components/section-title";
import { getLocalizedContent } from "@/lib/content";
import { getValidatedLocale } from "@/lib/validated-locale";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedMessagesPage({ params }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const locale = getValidatedLocale(rawLocale);
  const content = getLocalizedContent(locale);

  return (
    <AppShell locale={locale} path="/messages">
      <ProfileSetupGate locale={locale} currentPath="/messages">
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="rounded-[32px] border border-[var(--uy-line)] bg-[color:rgba(255,255,255,0.88)] p-6 shadow-[0_20px_60px_-45px_rgba(31,77,107,0.22)]">
            <SectionTitle eyebrow={content.messages.eyebrow} title={content.messages.title} description={content.messages.description} />
            <div className="mt-6 space-y-3">
              {content.conversations.map((conversation) => (
                <article key={conversation.id} className="rounded-[24px] bg-[var(--uy-sky-pale)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{conversation.riderName}</p>
                      <p className="text-sm text-slate-500">{content.roleLabels[conversation.role]} · {conversation.route}</p>
                    </div>
                    {conversation.unread > 0 ? (
                      <span className="rounded-full bg-[var(--uy-deep)] px-3 py-1 text-xs font-semibold text-[var(--uy-paper)]">
                        {conversation.unread}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{conversation.lastMessage}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{conversation.lastTimestamp}</p>
                </article>
              ))}
            </div>
          </aside>

          <article className="flex min-h-[560px] flex-col rounded-[32px] bg-[linear-gradient(160deg,var(--uy-deep),#0a78d1)] p-6 text-[var(--uy-paper)] shadow-[0_24px_70px_-50px_rgba(0,91,187,0.55)]">
            <div className="border-b border-white/10 pb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--uy-sky)]">{content.messages.activeConversation}</p>
              <h1 className="mt-2 font-serif text-2xl sm:text-3xl">{content.messages.activeTitle}</h1>
            </div>
            <div className="flex-1 space-y-4 py-6">
              <div className="max-w-[78%] rounded-[24px] rounded-bl-md bg-white/10 p-4 text-sm leading-7 text-[#e1ebe7]">
                {content.messages.sampleMessages[0]}
              </div>
              <div className="ml-auto max-w-[78%] rounded-[24px] rounded-br-md bg-[var(--uy-sun)] p-4 text-sm leading-7 text-[var(--uy-deep-strong)]">
                {content.messages.sampleMessages[1]}
              </div>
              <div className="max-w-[78%] rounded-[24px] rounded-bl-md bg-white/10 p-4 text-sm leading-7 text-[#e1ebe7]">
                {content.messages.sampleMessages[2]}
              </div>
            </div>
            <div className="rounded-[26px] bg-white/8 p-4">
              <div className="rounded-[22px] bg-white/90 px-4 py-5 text-sm text-slate-500">{content.messages.placeholder}</div>
              <div className="mt-4 flex justify-end">
                <button className="rounded-full bg-[var(--uy-sun)] px-5 py-3 text-sm font-semibold text-[var(--uy-deep-strong)]">{content.messages.send}</button>
              </div>
            </div>
          </article>
        </section>
      </ProfileSetupGate>
    </AppShell>
  );
}