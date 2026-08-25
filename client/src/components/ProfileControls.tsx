/**
 * BMR profile controls: a compact, accessible home for account language and Stripe-backed subscription actions across desktop and mobile workspace navigation.
 */
import { Button } from "@/components/ui/button";
import { LANGUAGE_OPTIONS, languageOptionFor, type LanguagePreference } from "@shared/languages";
import { CreditCard, Globe2, Loader2, Sparkles } from "lucide-react";
import React from "react";

type SubscriptionStatus = {
  plan: "free" | "pro";
  status: string;
  cancelAtPeriodEnd: boolean;
  hasBillingPortal: boolean;
};

type ProfileControlsProps = {
  name?: string | null;
  language: string | null | undefined;
  isSavingLanguage?: boolean;
  onLanguageChange: (language: LanguagePreference) => void;
  subscription?: SubscriptionStatus;
  subscriptionLoading?: boolean;
  billingLoading?: boolean;
  onUpgrade: () => void;
  onManagePlan: () => void;
  onLogout: () => void;
};

export function ProfileControls({ name, language, isSavingLanguage = false, onLanguageChange, subscription, subscriptionLoading = false, billingLoading = false, onUpgrade, onManagePlan, onLogout }: ProfileControlsProps) {
  const selectedLanguage = languageOptionFor(language);
  const isPro = subscription?.plan === "pro";

  return (
    <div className="border-t border-white/10 p-4">
      <p className="mb-3 font-mono text-[8px] tracking-[.12em] text-[#7f867b]">YOUR PROFILE</p>
      <div className="mb-4 flex items-center gap-3"><div className="grid size-8 place-items-center rounded-full bg-[#c7f36b] text-sm font-semibold text-[#10120f]">{name?.slice(0, 1).toUpperCase() ?? "U"}</div><div className="min-w-0"><p className="truncate text-sm text-[#e8e8e0]">{name ?? "Workspace user"}</p><p className="truncate font-mono text-[8px] tracking-[.08em] text-[#858b80]">SECURE SESSION</p></div></div>

      <label className="mb-4 block">
        <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[8px] tracking-[.1em] text-[#868d82]"><Globe2 className="size-3 text-[#c7f36b]" /> RESPONSE & VOICE LANGUAGE</span>
        <select aria-label="Response and voice language" value={selectedLanguage.id} disabled={isSavingLanguage} onChange={event => onLanguageChange(event.target.value as LanguagePreference)} className="h-9 w-full rounded-none border border-white/12 bg-black/15 px-2 text-xs text-[#e8e9e1] outline-none transition-colors focus:border-[#c7f36b] disabled:opacity-60">
          {LANGUAGE_OPTIONS.map(option => <option key={option.id} value={option.id} className="bg-[#161914] text-[#e8e9e1]">{option.label}</option>)}
        </select>
        <span className="mt-1 block text-[10px] leading-4 text-[#7f867b]">Text replies and voice use this choice when your browser supports the selected language.</span>
      </label>

      <div className="mb-3 border border-white/10 bg-black/10 p-3">
        <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[8px] tracking-[.1em] text-[#8d9588]">SUBSCRIPTION</p><p className="mt-1 text-sm font-medium text-[#eef0e8]">{subscriptionLoading ? "Checking plan…" : isPro ? "BMR Pro" : "Free workspace"}</p><p className="mt-1 text-[10px] leading-4 text-[#92988d]">{subscriptionLoading ? "Retrieving current billing status." : subscription?.cancelAtPeriodEnd ? "Cancels at the end of the current billing period." : subscription?.status ?? "Upgrade when you need reusable workboards and more capacity."}</p></div>{subscriptionLoading ? <Loader2 className="mt-1 size-4 animate-spin text-[#c7f36b]" /> : <CreditCard className="mt-1 size-4 text-[#c7f36b]" />}</div>
        {isPro && subscription?.hasBillingPortal ? <Button type="button" variant="outline" disabled={billingLoading} onClick={onManagePlan} className="mt-3 h-8 w-full rounded-none border-white/15 bg-transparent text-xs text-[#d7dcd2] hover:border-[#c7f36b]/50 hover:bg-[#c7f36b]/10 hover:text-[#c7f36b]">{billingLoading ? <Loader2 className="mr-1.5 size-3 animate-spin" /> : <CreditCard className="mr-1.5 size-3" />}Manage or cancel plan</Button> : <Button type="button" disabled={billingLoading} onClick={onUpgrade} className="mt-3 h-8 w-full rounded-none bg-[#c7f36b] text-xs font-semibold text-[#10120f] hover:bg-[#dafb94]"><Sparkles className="mr-1.5 size-3" />Upgrade to BMR Pro</Button>}
      </div>

      <Button variant="ghost" onClick={onLogout} className="h-9 w-full justify-start text-xs text-[#aab0a5] hover:bg-white/5 hover:text-white">Sign out</Button>
    </div>
  );
}
