import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col justify-center overflow-hidden py-16 sm:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2.5 rounded-full border bg-muted/60 px-3 py-1.5"
        >
          <span className="size-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
          <Badge variant="secondary" className="rounded-full px-2 font-mono text-[10px] uppercase tracking-wider">
            Online
          </Badge>
          <span className="text-xs text-muted-foreground sm:text-sm">Builder · AI · Web · Infra</span>
        </motion.div>

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
          <Button size="lg" variant="outline" className="h-12 px-7 font-mono" asChild>
            <a href="#contact">Contact</a>
          </Button>
        </motion.div>
      </div>

      {/* Compact stats strip — free about-us-01 pattern, no video */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mx-auto mt-16 w-full max-w-4xl px-4 sm:mt-20 sm:px-6"
      >
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
          {[
            { value: "6+", label: "Live products" },
            { value: "AI", label: "Agents & ops" },
            { value: "Web", label: "React · PWAs" },
            { value: "Cloud", label: "Workers · CDN" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 bg-card px-4 py-6 text-center"
            >
              <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
