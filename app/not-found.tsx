import Link from "next/link";
import { PageIntro } from "@/components/ui/PageIntro";

export default function NotFound() {
  return (
    <PageIntro eyebrow="404" title="This page has moved on" align="center" className="pb-24 md:pb-32">
      <p>The piece or page you&apos;re looking for isn&apos;t here any more.</p>
      <Link
        href="/shop"
        className="mt-8 inline-flex h-12 items-center rounded-[9px] bg-cta px-7 font-sans text-[14px] font-medium text-white transition-colors hover:bg-cta-hover"
      >
        Shop the Collection
      </Link>
    </PageIntro>
  );
}
