import { motion } from "framer-motion";
import { Cpu, Zap, Activity, Command, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";

const areas = [
  {
    icon: Cpu,
    title: "Autonomous AI Agents",
    description: "Designing intelligent agents capable of understanding context, planning execution steps, and operating independently to solve complex tasks.",
    id: "MOD_01"
  },
  {
    icon: Globe,
    title: "Web Applications",
    description: "Building responsive, accessible websites and web apps with modern frontend stacks — React, TypeScript, Tailwind CSS, and shadcn/ui. Deployed on Netlify with custom domains and SSL.",
    id: "MOD_02"
  },
  {
    icon: Zap,
    title: "Automation Pipelines",
    description: "End-to-end workflows that connect disparate APIs, cloud services, and local scripts into seamless, automated operations.",
    id: "MOD_03"
  },
  {
    icon: Activity,
    title: "Network-Aware Systems",
    description: "Monitoring, diagnostic, and automation tools built with deep network protocol understanding for robust infrastructure management.",
    id: "MOD_04"
  },
  {
    icon: Command,
    title: "CLI-Driven Tools",
    description: "Fast, efficient command-line applications for developers and sysadmins to manage environments without leaving the terminal.",
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
          {/* Faint connecting lines */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border/50 hidden md:block -z-10" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/50 hidden md:block -z-10" />

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
                
                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}