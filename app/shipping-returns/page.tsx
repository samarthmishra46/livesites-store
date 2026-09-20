import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/PageIntro";
import { Prose } from "@/components/ui/Prose";
import { shippingRates } from "@/data/pages";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Free shipping on orders over $100 and easy returns within 30 days.",
};

const toc = [
  { id: "shipping", label: "Shipping" },
  { id: "rates", label: "Rates & timings" },
  { id: "returns", label: "Returns" },
  { id: "exchanges", label: "Exchanges" },
  { id: "refunds", label: "Refunds" },
];

export default function ShippingReturnsPage() {
  return (
    <>
      <PageIntro eyebrow="Help" title="Shipping & Returns">
        <p>Free shipping on orders over $100, and 30 days to decide. Every order ships in recycled, plastic-free packaging.</p>
      </PageIntro>
      <Prose toc={toc}>
        <h2 id="shipping">Shipping</h2>
        <p>
          Orders placed before 1pm ET on a business day leave our studio the same day. You&apos;ll receive a tracking link by
          email as soon as your parcel is on its way.
        </p>

        <h2 id="rates">Rates &amp; timings</h2>
        <div className="mt-5 overflow-hidden rounded-xl border border-line">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-ivory text-[12px] tracking-[0.08em] text-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Method</th>
                <th scope="col" className="px-4 py-3 font-medium">Delivery</th>
                <th scope="col" className="px-4 py-3 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shippingRates.map((r) => (
                <tr key={r.method}>
                  <th scope="row" className="px-4 py-3 font-normal text-ink">{r.method}</th>
                  <td className="px-4 py-3">{r.time}</td>
                  <td className="px-4 py-3">{r.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="returns">Returns</h2>
        <p>
          You can return unworn pieces with their tags attached within <strong>30 days</strong> of delivery. Start a return
          from your account or by contacting us, and we&apos;ll email a prepaid label — returns within the US are free.
        </p>
        <ul>
          <li>Pieces must be unworn, unwashed and in their original packaging.</li>
          <li>Earrings and other pierced jewellery can&apos;t be returned for hygiene reasons.</li>
          <li>Altered pieces can&apos;t be returned, but we&apos;re always happy to help if something isn&apos;t right.</li>
        </ul>

        <h2 id="exchanges">Exchanges</h2>
        <p>
          Need a different size? Ask your live stylist or request an exchange in your account. We&apos;ll ship the new size as
          soon as your return is scanned by the carrier, so you&apos;re not left waiting.
        </p>

        <h2 id="refunds">Refunds</h2>
        <p>
          Refunds are issued to your original payment method within 5 business days of your return reaching us. You&apos;ll get
          an email as soon as it has been processed.
        </p>
      </Prose>
    </>
  );
}
