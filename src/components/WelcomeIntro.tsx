import { useEffect, useState } from "react";
import ladyImg from "@/assets/welcome-lady.jpg";
import logoImg from "@/assets/logo.png";

export function WelcomeIntro() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 4700);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;

  return (
    <div className="animate-veil-out fixed inset-0 z-50 overflow-hidden bg-background">
      {/* Curtains */}
      <div className="animate-curtain-left absolute inset-y-0 left-0 z-20 w-1/2 bg-secondary" />
      <div className="animate-curtain-right absolute inset-y-0 right-0 z-20 w-1/2 bg-secondary" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        <div className="animate-lady-in relative">
          <img
            src={ladyImg}
            alt="Indian lady in a gold-bordered saree welcoming guests with a namaste"
            width={1280}
            height={1600}
            className="h-[46vh] w-auto rounded-full object-cover object-top ring-1 ring-primary/40 sm:h-[52vh]"
            style={{ boxShadow: "var(--shadow-gold)" }}
          />
          <span className="animate-sparkle absolute -right-2 top-10 text-2xl text-primary">✦</span>
          <span
            className="animate-sparkle absolute -left-4 bottom-24 text-xl text-primary"
            style={{ animationDelay: "0.9s" }}
          >
            ✦
          </span>
        </div>

        <p
          className="animate-soft-rise mt-8 text-xs uppercase tracking-[0.55em] text-muted-foreground"
          style={{ animationDelay: "1.4s" }}
        >
          Swagatam
        </p>

        <img
          src={logoImg}
          alt="Khan Jewellers logo"
          className="animate-soft-rise mt-4 h-16 w-16 rounded-full ring-1 ring-primary/40"
          style={{ animationDelay: "1.6s" }}
        />
        <h1 className="animate-name-reveal mt-3 text-center font-display text-5xl font-light sm:text-7xl">
          <span className="text-gold-gradient animate-shimmer">Khan Jewellers</span>
        </h1>

        <p
          className="animate-soft-rise mt-4 text-[0.7rem] uppercase tracking-[0.4em] text-muted-foreground"
          style={{ animationDelay: "2.9s" }}
        >
          Rajarhat &middot; Kolkata
        </p>
      </div>
    </div>
  );
}
