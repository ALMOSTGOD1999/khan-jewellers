import { collections, type CollectionKey } from "@/lib/collections";

export function CollectionPage({ id }: { id: CollectionKey }) {
  const c = collections[id];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <figure className="card-lux overflow-hidden rounded-sm p-2">
          <img
            src={c.img}
            alt={`Indian lady wearing ${c.label.toLowerCase()} from Khan Jewellers`}
            width={1024}
            height={1280}
            className="h-full w-full rounded-sm object-cover"
          />
        </figure>
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.4em] text-primary">{c.tag}</p>
          <h1 className="mt-4 font-display text-6xl">{c.label}</h1>
          <div className="gold-rule mt-6 w-28" />
          <p className="mt-6 leading-relaxed text-muted-foreground">{c.copy}</p>
          <ul className="mt-8 grid grid-cols-2 gap-3 text-sm">
            {c.items.map((item) => (
              <li key={item} className="border-l border-primary/50 pl-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-24 text-center">
        <p className="text-[0.7rem] uppercase tracking-[0.4em] text-primary">Lookbook</p>
        <h2 className="mt-3 font-display text-4xl">Worn with Grace</h2>
        <div className="gold-rule mx-auto mt-4 w-20" />
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {c.gallery.map((src, i) => (
          <figure key={i} className="card-lux overflow-hidden rounded-sm p-2">
            <img
              src={src}
              alt={`Model wearing ${c.label.toLowerCase()}`}
              loading="lazy"
              width={1024}
              height={1280}
              className="aspect-[4/5] w-full rounded-sm object-cover"
            />
          </figure>
        ))}
      </div>

      <div className="mt-24 text-center">
        <p className="text-[0.7rem] uppercase tracking-[0.4em] text-primary">In the Showroom</p>
        <h2 className="mt-3 font-display text-4xl">Featured Pieces</h2>
        <div className="gold-rule mx-auto mt-4 w-20" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {c.products.map((p) => (
          <div key={p.name} className="card-lux group overflow-hidden rounded-sm p-2">
            <img
              src={p.img}
              alt={p.name}
              loading="lazy"
              className="aspect-square w-full rounded-sm object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <p className="p-3 text-center font-display text-lg">{p.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
