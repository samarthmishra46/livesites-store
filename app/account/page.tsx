import type { Metadata } from "next";
import { AccountView } from "@/components/account/AccountView";
import { PageIntro } from "@/components/ui/PageIntro";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <>
      <PageIntro eyebrow="Account" title="Your Livesites" />
      <AccountView />
    </>
  );
}
