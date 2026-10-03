import { createFileRoute } from "@tanstack/react-router";
import { SHOP } from "@/lib/collections";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Location — Khan Jewellers, Noipukur Rajarhat" },
      {
        name: "description",
        content:
          "Visit Khan Jewellers at Noipukur, Rajarhat, North 24 Parganas 700135. Call 8240570878 or 7439491412.",
      },
      { property: "og:title", content: "Contact Khan Jewellers" },
      {
        property: "og:description",
        content: "Showroom address, phone numbers and map for Khan Jewellers, Rajarhat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const q = encodeURIComponent(SHOP.mapQuery);
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="text-center">
        <p className="text-[0.7rem] uppercase tracking-[0.4em] text-primary">Visit Us</p>
        <h1 className="mt-4 font-display text-6xl">Contact</h1>
        <div className="gold-rule mx-auto mt-6 w-28" />
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <div className="card-lux rounded-sm p-8">
          <h3 className="font-display text-2xl text-primary">Showroom</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {SHOP.address.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
        <div className="card-lux rounded-sm p-8">
          <h3 className="font-display text-2xl text-primary">Call us</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {SHOP.phones.map((p) => (
              <li key={p}>
                <a href={`tel:+91${p}`} className="hover:text-primary">
                  +91 {p}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-lux rounded-sm p-8">
          <h3 className="font-display text-2xl text-primary">Hours</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Mon – Sat: 11am – 8:30pm</li>
            <li>Sunday: 12pm – 7pm</li>
          </ul>
        </div>
      </div>

      <div className="card-lux mt-10 overflow-hidden rounded-sm p-2">
        <iframe
          title="Khan Jewellers location"
          src={`https://maps.google.com/maps?q=${q}&z=16&output=embed`}
          className="h-[450px] w-full rounded-sm border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="mt-4 text-center">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${q}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs uppercase tracking-[0.3em] text-primary hover:underline"
        >
          Get directions
        </a>
      </div>
    </section>
  );
}
