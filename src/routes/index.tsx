import { createFileRoute, Link } from "@tanstack/react-router";
import { WelcomeIntro } from "@/components/WelcomeIntro";
import { collections } from "@/lib/collections";
import logoImg from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Khan Jewellers — Gold, Silver & Pearl in Rajarhat, Kolkata" },
      {
        name: "description",
        content:
          "Khan Jewellers, Noipukur Rajarhat. Hallmarked gold, sterling silver and pearl jewellery, bridal sets and custom design.",
      },
      { property: "og:title", content: "Khan Jewellers — Rajarhat, Kolkata" },
      {
        property: "og:description",
        content: "Handcrafted gold, silver and pearl jewellery from our Rajarhat showroom.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <WelcomeIntro />
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <img
          src={logoImg}
          alt="Khan Jewellers logo"
          className="mx-auto mb-8 h-28 w-28 rounded-full ring-1 ring-primary/40"
          style={{ boxShadow: "var(--shadow-gold)" }}
        />
        <p className="text-[0.7rem] uppercase tracking-[0.5em] text-muted-foreground">
          Noipukur &middot; Rajarhat, Kolkata
        </p>
        <h1 className="mt-6 font-display text-6xl leading-[0.95] sm:text-8xl">
          <span className="text-gold-gradient animate-shimmer">Khan Jewellers</span>
        </h1>
        <div className="gold-rule mx-auto mt-8 w-56" />
        <p className="mx-auto mt-8 max-w-xl leading-relaxed text-muted-foreground">
          Handcrafted gold, silver and pearl adornment — made for weddings, festivals and the days
          in between.
        </p>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
        {(["gold", "silver", "pearl"] as const).map((k) => (
          <Link
            key={k}
            to={`/${k}`}
            className="card-lux group block overflow-hidden rounded-sm p-2"
          >
            <img
              src={collections[k].img}
              alt={collections[k].label}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-sm object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="p-4 text-center">
              <h2 className="font-display text-3xl">{collections[k].label}</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-primary">Explore</p>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
