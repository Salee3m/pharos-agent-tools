import { motion } from "framer-motion";
import { Activity, Cloud, Cpu, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Cpu,
    title: "AI agents",
    description: "Autonomous agents that plan, run, and ship work without babysitting.",
  },
  {
    icon: Globe,
    title: "Web apps",
    description: "React, TypeScript, Tailwind, shadcn — fast PWAs with real polish.",
  },
  {
    icon: Activity,
    title: "Products",
    description: "Live SaaS and tools: payments, APIs, OTP, utilities people use daily.",
  },
  {
    icon: Cloud,
    title: "Infrastructure",
    description: "Cloudflare Workers, KV, Render, Linux — built to stay up.",
  },
] as const;

export function Features() {
  return (
    <section id="build" className="py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 max-w-2xl space-y-3 sm:mb-16"
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            What I build
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Focused systems. Less noise. Live deployments.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Card className="h-full border bg-card shadow-none card-machined">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="flex size-10 items-center justify-center rounded-md border bg-secondary">
                    <feature.icon className="size-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
