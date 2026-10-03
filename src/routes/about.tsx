import { createFileRoute } from "@tanstack/react-router";
import showroomImg from "@/assets/showroom.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Khan Jewellers, Rajarhat" },
      {
        name: "description",
        content: "The story of Khan Jewellers, a family jewellery house in Noipukur, Rajarhat.",
      },
      { property: "og:title", content: "About Khan Jewellers" },
      { property: "og:description", content: "A family jewellery house in Rajarhat, Kolkata." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
      <div>
        <p className="text-[0.7rem] uppercase tracking-[0.4em] text-primary">Our Story</p>
        <h1 className="mt-4 font-display text-6xl">About Us</h1>
        <div className="gold-rule mt-6 w-28" />
        <p className="mt-6 leading-relaxed text-muted-foreground">
          Khan Jewellers serves families across Kolkata from our showroom in Noipukur, Rajarhat.
          Every piece is BIS hallmarked, weighed in front of you, and finished by karigars who have
          been with the family for decades.
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          We offer custom bridal commissions, old-gold exchange at fair daily rates, lifetime
          polishing and a transparent buy-back policy.
        </p>
        <dl className="mt-10 grid grid-cols-3 gap-6">
          {[
            ["45+", "Years of craft"],
            ["BIS", "Hallmarked gold"],
            ["12k+", "Families served"],
          ].map(([k, v]) => (
            <div key={v}>
              <dt className="font-display text-3xl text-gold-gradient">{k}</dt>
              <dd className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <figure className="card-lux overflow-hidden rounded-sm p-2">
        <img
          src={showroomImg}
          alt="Khan Jewellers showroom interior"
          width={1600}
          height={1008}
          className="w-full rounded-sm object-cover"
        />
      </figure>
    </section>
  );
}
