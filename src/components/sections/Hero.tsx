import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { openTerminal } from "@/components/fun/FunLayer";

function useCountUp(target: number, active: boolean, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}

function StatCell({
  value,
  label,
  numeric,
  active,
}: {
  value: string;
  label: string;
  numeric?: number;
  active: boolean;
}) {
  const n = useCountUp(numeric ?? 0, active && numeric != null);
  return (
    <div className="flex flex-col items-center gap-1 bg-card px-4 py-6 text-center transition-colors hover:bg-muted/40">
      <span className="text-2xl font-semibold tracking-tight tabular-nums">
        {numeric != null ? `${n}+` : value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export function Hero() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStatsInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col justify-center overflow-hidden py-16 sm:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 text-center sm:px-6">
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => openTerminal()}
          className="group flex items-center gap-2.5 rounded-full border bg-muted/60 px-3 py-1.5 transition-colors hover:border-foreground/30 hover:bg-muted"
          title="Open terminal (`)"
        >
          <span className="size-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)] group-hover:animate-pulse" />
          <Badge
            variant="secondary"
            className="rounded-full px-2 font-mono text-[10px] uppercase tracking-wider"
          >
            Online
          </Badge>
          <span className="text-xs text-muted-foreground sm:text-sm">
            Builder · AI · Web · Infra
          </span>
          <Terminal className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="text-fluid-display font-bold tracking-tight text-balance"
        >
          Sirleeem
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="max-w-xl text-base text-muted-foreground sm:text-lg"
        >
          I ship live products — web apps, AI agents, and cloud systems people actually use.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Button size="lg" className="h-12 gap-2 px-7 font-mono" asChild>
            <a href="#work">
              View work
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="h-12 gap-2 px-7 font-mono" onClick={() => openTerminal()}>
            <Terminal className="size-4" />
            Terminal
          </Button>
        </motion.div>

        <p className="font-mono text-[10px] text-muted-foreground/70">
          press <kbd className="rounded border px-1 py-0.5">`</kbd> for shell · konami works too
        </p>
      </div>

      <motion.div
        ref={statsRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mx-auto mt-16 w-full max-w-4xl px-4 sm:mt-20 sm:px-6"
      >
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
          <StatCell value="6+" label="Live products" numeric={6} active={statsInView} />
          <StatCell value="AI" label="Agents & ops" active={statsInView} />
          <StatCell value="Web" label="React · PWAs" active={statsInView} />
          <StatCell value="Cloud" label="Workers · CDN" active={statsInView} />
        </div>
      </motion.div>
    </section>
  );
}
