import { motion } from "framer-motion";
import { Terminal, Network, Cloud, BrainCircuit, Globe } from "lucide-react";

export function About() {
  return (
    <section id="about" className="py-32 relative">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 flex items-center gap-4"
        >
          <div className="w-12 h-px bg-border" />
          <h2 className="text-3xl md:text-4xl font-bold font-sans tracking-tight">Initialize(Context)</h2>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 space-y-6 text-lg text-muted-foreground leading-relaxed"
          >
            <p className="text-xl text-foreground font-medium">
              I build and ship products — web apps, AI tools, automation systems and cloud infrastructure — end to end, from idea to live deployment.
            </p>
            <p>
              Frontend in React, TypeScript, Tailwind and shadcn/ui; backends in FastAPI and Cloudflare Workers. Systems live in the terminal — Hermes agents, multi-agent orchestration, Linux and network-aware automation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 grid gap-4 relative"
          >
            <div className="absolute -left-8 top-0 bottom-0 w-px bg-border hidden lg:block" />

            <div className="p-6 rounded-xl border bg-card module-card">
              <h3 className="font-mono text-sm text-muted-foreground mb-6 pb-4 border-b uppercase tracking-wider">System.Specs</h3>
              <ul className="space-y-6">
                {[
                  { icon: BrainCircuit, title: "AI & Agents", desc: "Hermes, multi-agent orchestration, automation" },
                  { icon: Globe, title: "Web Development", desc: "React, TypeScript, Tailwind, shadcn/ui" },
                  { icon: Cloud, title: "Cloud Infrastructure", desc: "Cloudflare Workers, Render, KV, CDN" },
                  { icon: Terminal, title: "Backend & APIs", desc: "FastAPI, REST APIs, OTP/SMS + webhooks" },
                  { icon: Network, title: "Networking", desc: "TCP/IP, routing & network troubleshooting" }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 group">
                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border group-hover:border-foreground/30 transition-colors">
                      <item.icon className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground font-sans">{item.title}</div>
                      <div className="text-sm text-muted-foreground">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
