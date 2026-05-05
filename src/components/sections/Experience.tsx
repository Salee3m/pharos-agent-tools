import { motion } from "framer-motion";
import { TerminalSquare } from "lucide-react";

const experiences = [
  {
    role: "Web Developer",
    company: "Freelance / Independent",
    period: "2018 - Present",
    description: "Building responsive websites and web applications using modern frontend technologies. From semantic HTML and CSS to full React + TypeScript apps with Tailwind CSS and shadcn/ui. Deploying on Netlify with custom domains, SSL, and DNS configuration.",
    tags: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Tailwind", "Netlify"]
  },
  {
    role: "Automation Architect",
    company: "Freelance / Independent",
    period: "2025 - Present",
    description: "Designing and deploying autonomous AI agent systems and infrastructure automation pipelines for technical clients.",
    tags: ["AI Agents", "Pipelines", "Infrastructure"]
  },
  {
    role: "Network & Systems Engineer",
    company: "IT Infrastructure Sector",
    period: "2023 - 2025",
    description: "Worked in core network engineering — configuring and maintaining routers, switches, and network infrastructure. Hands-on with IP addressing, subnetting, routing protocols, and real-world network troubleshooting.",
    tags: ["TCP/IP", "Routing", "Troubleshooting"]
  }
];

export function Experience() {
  return (
    <section id="experience" className="py-32 relative">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 flex items-center gap-4"
        >
          <div className="w-12 h-px bg-border" />
          <h2 className="text-3xl md:text-4xl font-bold font-sans tracking-tight">System.History</h2>
        </motion.div>

        <div className="relative pl-8 md:pl-0">
          <div className="absolute left-0 md:left-[50%] md:-ml-px top-0 bottom-0 w-px bg-border" />
          
          <div className="space-y-16">
            {experiences.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="relative flex flex-col md:flex-row md:items-center md:justify-between group"
              >
                {/* Center marker */}
                <div className="absolute -left-10 md:left-1/2 md:-ml-3 w-6 h-6 rounded-sm bg-background border flex items-center justify-center z-10 top-0 md:top-1/2 md:-translate-y-1/2 group-hover:border-foreground transition-colors">
                  <TerminalSquare className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
                </div>

                <div className={`w-full md:w-[calc(50%-3rem)] ${i % 2 === 0 ? "md:text-right md:pr-8" : "md:pl-8 md:ml-auto"}`}>
                  <div className="p-6 rounded-xl border bg-card module-card relative">
                    <div className="absolute top-0 right-0 pt-4 pr-6 font-mono text-xs font-semibold text-foreground/50 hidden md:block">
                      [{exp.period}]
                    </div>
                    <div className={`font-mono text-xs font-semibold text-foreground/60 mb-2 md:hidden ${i % 2 === 0 ? "md:text-right" : ""}`}>
                      [{exp.period}]
                    </div>
                    
                    <h3 className="font-bold text-xl mb-1 text-foreground">{exp.role}</h3>
                    <div className={`text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wider ${i % 2 === 0 ? "md:justify-end" : ""}`}>{exp.company}</div>
                    <p className={`text-sm text-foreground/70 leading-relaxed mb-4 ${i % 2 === 0 ? "md:text-right" : "text-left"}`}>{exp.description}</p>
                    
                    <div className={`flex flex-wrap gap-2 ${i % 2 === 0 ? "md:justify-end" : ""}`}>
                      {exp.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-mono px-2 py-1 bg-secondary rounded-sm text-muted-foreground border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}