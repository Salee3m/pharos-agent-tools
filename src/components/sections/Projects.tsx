import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const projects = [
  {
    title: "Salim Technology",
    description: "Company site and product line — software, AI, cloud.",
    stack: ["React", "Design system", "Cloud"],
    link: "https://salimtechnology.com",
  },
  {
    title: "Salim Tools",
    description: "Free offline-first utilities. No signup.",
    stack: ["PWA", "Workers", "KV"],
    link: "https://tools.salimtechnology.com",
  },
  {
    title: "Salim SMS",
    description: "OTP numbers, real-time codes, developer API.",
    stack: ["API", "Payments", "Webhooks"],
    link: "https://sms.salimtechnology.com",
  },
  {
    title: "PharosGuard",
    description: "AI website security reports from a domain.",
    stack: ["FastAPI", "DNS/SSL", "AI"],
    link: "https://pharosguard.xyz",
  },
  {
    title: "AgentHansa agent",
    description: "Unattended earning agent — quests, cron, USDC.",
    stack: ["Hermes", "Cron", "USDC"],
    link: "#",
  },
  {
    title: "Hermes orchestrator",
    description: "Multi-agent routing across research, writing, eng.",
    stack: ["Python", "Agents", "Linux"],
    link: "#",
  },
] as const;

export function Projects() {
  return (
    <section id="work" className="border-t bg-muted/30 py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 max-w-2xl space-y-3 sm:mb-16"
        >
          <Badge variant="outline" className="font-normal">
            Work
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            Live deployments
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Real products in production — not mockups.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              <Card className="flex h-full flex-col border border-border/60 bg-card p-5 shadow-none card-machined transition-colors hover:border-foreground/20">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold leading-snug">{project.title}</h3>
                  {project.link !== "#" && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`Open ${project.title}`}
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>

                <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 border-t border-border/50 pt-4">
                  {project.stack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="bg-muted/60 font-mono text-[10px]"
                    >
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
