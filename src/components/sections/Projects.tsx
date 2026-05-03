import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink, GitBranch } from "lucide-react";

const projects = [
  {
    title: "Hermes Agent Orchestrator",
    description: "An autonomous AI agent system utilizing Hermes models for end-to-end task automation and orchestration across distributed environments.",
    problem: "Manual intervention required for complex multi-step deployment tasks.",
    stack: ["Python", "Hermes API", "LangChain", "Linux"],
    link: "#"
  },
  {
    title: "OpenClaw Bridge",
    description: "A secure integration layer bridging cloud AI execution environments with local hardware, enabling secure remote command execution.",
    problem: "Lack of secure, seamless communication between cloud AI agents and local subnets.",
    stack: ["Python", "OpenClaw", "WebSockets", "Docker"],
    link: "#"
  },
  {
    title: "NetMonitor Daemon",
    description: "A network-aware automation tool that actively monitors subnet health, triggering remediation scripts upon detecting anomalies.",
    problem: "Reactive network troubleshooting causing prolonged downtime.",
    stack: ["Bash", "Python", "TCP/IP", "Cron"],
    link: "#"
  },
  {
    title: "API Sync Pipeline",
    description: "A resilient API-based automation system that synchronizes state across multiple enterprise SaaS platforms securely.",
    problem: "Data silos and state drift across enterprise tools.",
    stack: ["Python", "REST APIs", "OAuth2", "Systemd"],
    link: "#"
  }
];

export function Projects() {
  return (
    <section id="projects" className="py-24 bg-secondary/30 border-t">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-2">Execute(Deployments)</h2>
          <div className="h-1 w-20 bg-accent rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="p-6 h-full flex flex-col border-border/50 hover:border-accent/40 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-accent" />
                    {project.title}
                  </h3>
                  <a href={project.link} className="text-muted-foreground hover:text-foreground transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
                
                <p className="text-muted-foreground mb-4 flex-grow">
                  {project.description}
                </p>
                
                <div className="mb-6 space-y-2">
                  <span className="text-sm font-medium text-foreground block">Problem Solved:</span>
                  <p className="text-sm text-muted-foreground border-l-2 border-muted pl-3 py-1">
                    {project.problem}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/50">
                  {project.stack.map(tech => (
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
