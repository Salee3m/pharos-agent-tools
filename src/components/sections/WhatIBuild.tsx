import { motion } from "framer-motion";
import { Cpu, Zap, Activity, Globe, Cloud } from "lucide-react";
import { Card } from "@/components/ui/card";

const areas = [
  {
    icon: Cpu,
    title: "Autonomous AI Agents",
    description: "Designing intelligent agents that understand context, plan execution steps and operate independently to solve complex tasks — deployed and orchestrated end to end.",
    id: "MOD_01"
  },
  {
    icon: Globe,
    title: "Web Applications",
    description: "Responsive, accessible sites and web apps with modern stacks — React, TypeScript, Tailwind and shadcn/ui. Offline-capable PWAs deployed on Cloudflare with custom domains and SSL.",
    id: "MOD_02"
  },
  {
    icon: Zap,
    title: "Products & SaaS",
    description: "Shipping real, live products — from OTP/SMS verification platforms to free utility suites — with developer APIs, payments and production infrastructure behind them.",
    id: "MOD_03"
  },
  {
    icon: Activity,
    title: "Automation Pipelines",
    description: "End-to-end workflows that connect APIs, cloud services and local scripts into seamless, autonomous operations — from cron-driven agents to scheduled job systems.",
    id: "MOD_04"
  },
  {
    icon: Cloud,
    title: "Cloud Infrastructure",
    description: "Scalable architecture and reliable DevOps — Cloudflare Workers, KV, Render, CDNs and headless Linux — engineered for speed, resilience and growth.",
    id: "MOD_05"
  }
];

export function WhatIBuild() {
  return (
    <section id="what-i-build" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 flex items-center gap-4"
        >
          <div className="w-12 h-px bg-border" />
          <h2 className="text-3xl md:text-4xl font-bold font-sans tracking-tight">Systems.Output</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 relative">
          {areas.map((area, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full border bg-card module-card group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  {area.id}
                </div>

                <div className="p-8 flex flex-col h-full relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-secondary border flex items-center justify-center mb-6 group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                    <area.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-sans">{area.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {area.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
