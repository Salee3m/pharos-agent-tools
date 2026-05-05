import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink, GitBranch } from "lucide-react";

const featuredProjects = [
  {
    title: "Sirleeem.xyz — Portfolio Site",
    description:
      "Personal portfolio and project showcase built with React + Vite + shadcn/ui. Features dark-themed terminal aesthetic, live project cards, animated terminal window, and section-based layout.",
    problem:
      "Needed a professional landing page to showcase AI agent, Web3, and automation projects. Built a responsive single-page app with a dev/terminal theme that reflects the builder's identity.",
    stack: ["React", "Vite", "shadcn/ui", "TypeScript", "Framer Motion", "Netlify", "Tailwind"],
    link: "https://sirleeem.xyz",
  },
  {
    title: "PharosGuard — Wallet Risk Analysis",
    description:
      "Real-time wallet risk analysis tool for the Pharos ecosystem. Enter any 0x address and get instant trust signals — risk score (0-100), transaction velocity, interaction diversity, and suspicious pattern flags.",
    problem:
      "Pharos ecosystem needed a simple way to evaluate wallet trust. Built a tool that pulls live on-chain data from Pharos RPC + Pharosscan explorer API and generates instant risk profiles.",
    stats: "Live at pharosguard.xyz · FastAPI + Tailscale Funnel",
    stack: ["FastAPI", "Pharos RPC", "SocialScan API", "Netlify", "Tailscale"],
    link: "https://pharosguard.xyz",
  },
  {
    title: "Pharos RWA Farm Tokenizer",
    description:
      "A real-world asset tokenization dApp on the Pharos blockchain. Tokenizes farm produce into digital assets on-chain — bridging agricultural commodities with DeFi liquidity.",
    problem:
      "Traditional farm produce lacks digital liquidity. Built a JSON-RPC dApp on Pharos Pacific Mainnet that connects MetaMask and represents real farm assets as on-chain tokens.",
    stats: "Pharos Pacific Mainnet · ChainID 1672 · MetaMask",
    stack: ["Pharos", "Solidity", "JSON-RPC", "MetaMask", "Netlify"],
    link: "https://pharos-rwa.netlify.app",
  },
  {
    title: "AgentHansa Autonomous Earning Agent",
    description:
      "A fully autonomous AI agent deployed on the AgentHansa marketplace (21K+ agents) that earns real USDC 24/7 — running cron-driven daily quests, catching red packets every 3 hours, and submitting alliance-war quests without human intervention.",
    problem:
      "Earning on a competitive AI agent marketplace required constant manual effort. Built an autonomous system that handles the full loop — checkins, quests, red packets, and submissions — running entirely on cron with AI-powered decision making.",
    stats: "Elite tier · 359 reputation · $12.77 earned · 32 red packets · 7 quests completed",
    stack: ["Hermes AI", "Claude Code", "AgentHansa API", "Cron", "FluxA Wallet", "USDC"],
    link: "#",
  },
  {
    title: "Hermes Agent Orchestrator",
    description:
      "A multi-agent orchestration system that delegates tasks across specialist AI profiles (research, writing, engineering) — coordinating autonomous workflows through structured handoff protocols.",
    problem:
      "Complex multi-step tasks require different skill sets. Built an orchestrator that decomposes problems, routes work to specialists, and synthesizes results into coherent outputs.",
    stack: ["Python", "Hermes API", "Multi-Agent", "Linux", "Cron"],
    link: "#",
  },
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
          {featuredProjects.map((project, i) => (
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
                    <GitBranch className="w-5 h-5 text-accent flex-shrink-0" />
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
                  <div className="mb-3">
                    <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded inline-block">
                      {project.stats}
                    </span>
                  </div>
                )}
                <div className="mb-6 space-y-2">
                  <span className="text-sm font-medium text-foreground block">Problem Solved:</span>
                  <p className="text-sm text-muted-foreground border-l-2 border-muted pl-3 py-1">
                    {project.problem}
                  </p>
                </div>

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
