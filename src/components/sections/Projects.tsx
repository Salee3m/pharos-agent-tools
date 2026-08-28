import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink, GitBranch } from "lucide-react";

// Current, live deployments — kept in sync with what's actually shipped.
const featuredProjects = [
  {
    title: "Salim Technology",
    description:
      "Flagship company and product line — intelligent systems, software and cloud infrastructure. A focused practice spanning custom software, AI & automation, and cloud infrastructure, built for performance and long-term maintainability.",
    stats: "Live · salimtechnology.com · custom design system",
    stack: ["React", "Vite", "Cloud Infrastructure", "AI & Automation", "Archivo", "Design System"],
    link: "https://salimtechnology.com",
  },
  {
    title: "Salim Tools",
    description:
      "A growing suite of fast, free, offline-first online utilities — a PDF editor, a drop tool and everyday helpers that just work, with no sign-up and no account required.",
    stats: "Live · tools.salimtechnology.com · Cloudflare Worker + KV · PWA",
    stack: ["React", "Vite", "Cloudflare Workers", "KV", "PWA", "Tailwind"],
    link: "https://tools.salimtechnology.com",
  },
  {
    title: "Salim SMS",
    description:
      "SMS verification and OTP delivery platform — instant number provisioning, real-time codes and a developer API for reliable phone verification at scale.",
    stats: "Live · sms.salimtechnology.com · developer API",
    stack: ["API", "OTP/SMS", "Provisioning", "Webhooks", "Paystack"],
    link: "https://sms.salimtechnology.com",
  },
  {
    title: "PharosGuard — AI Website Security",
    description:
      "Non-invasive website security intelligence. Enter any domain and get a public security posture report — DNS, SSL/TLS, HTTP security headers, SPF/DMARC plus an AI-written assessment of the findings.",
    stats: "Live · pharosguard.xyz · FastAPI · AI report",
    stack: ["FastAPI", "Python", "DNS/SSL", "Security Headers", "AI Report", "Tailscale"],
    link: "https://pharosguard.xyz",
  },
  {
    title: "AgentHansa Earning Agent",
    description:
      "An autonomous AI agent on the AgentHansa marketplace earning USDC around the clock — cron-driven check-ins, quests, red packets and submissions with no human intervention.",
    stats: "Runs fully unattended · cron-driven · USDC",
    stack: ["Hermes AI", "Claude Code", "AgentHansa API", "Cron", "USDC"],
    link: "#",
  },
  {
    title: "Hermes Agent Orchestrator",
    description:
      "A multi-agent orchestrator that decomposes complex work and routes it across specialist profiles — research, writing and engineering — then synthesizes the results into coherent output.",
    stats: "Routing pipeline · Python + Hermes API",
    stack: ["Python", "Hermes API", "Multi-Agent", "Linux", "Cron"],
    link: "#",
  },
];

export function Projects() {
  return (
    <section id="projects" className="py-32">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 flex items-center gap-4"
        >
          <div className="w-12 h-px bg-border" />
          <h2 className="text-3xl md:text-4xl font-bold font-sans tracking-tight">Execute(Deployments)</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {featuredProjects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="p-6 h-full flex flex-col card-machined border-border/50 hover:border-foreground/25 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    {project.title}
                  </h3>
                  {project.link !== "#" && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>

                <p className="text-muted-foreground mb-4 flex-grow">
                  {project.description}
                </p>

                {project.stats && (
                  <p className="mb-6 text-sm text-muted-foreground">
                    {project.stats}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/50">
                  {project.stack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="font-mono text-xs bg-muted/50">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
