import { motion } from "framer-motion";

const skillCategories = [
  {
    id: "SYS_01",
    title: "AI & Automation",
    skills: ["Agent Systems", "Workflow Automation", "Prompt Engineering", "LLM Orchestration"]
  },
  {
    id: "SYS_02",
    title: "Networking",
    skills: ["TCP/IP", "Subnetting", "Routing & Switching", "Network Troubleshooting", "Firewalls", "IP Addressing"]
  },
  {
    id: "SYS_03",
    title: "Web Development",
    skills: ["React", "Vite", "TypeScript", "Tailwind CSS", "shadcn/ui", "REST APIs", "Netlify", "Responsive Design"]
  },
  {
    id: "SYS_04",
    title: "Tools & Environments",
    skills: ["Hermes", "OpenClaw", "Linux", "Git", "Cloud VMs"]
  },
  {
    id: "SYS_05",
    title: "Programming & Systems",
    skills: ["Python", "Bash Scripting", "CLI Usage", "Remote Server Management", "REST APIs"]
  }
];

export function Skills() {
  return (
    <section id="skills" className="py-32 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 flex items-center gap-4"
        >
          <div className="w-12 h-px bg-border" />
          <h2 className="text-3xl md:text-4xl font-bold font-sans tracking-tight">Capabilities.List()</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-x-12 gap-y-16">
          {skillCategories.map((category, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex items-end gap-4 mb-6 pb-2 border-b border-border/50">
                <span className="font-mono text-xs text-muted-foreground">{category.id}</span>
                <h3 className="text-xl font-bold tracking-tight text-foreground">{category.title}</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {category.skills.map((skill, j) => (
                  <div 
                    key={j} 
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-card border module-card text-sm font-mono text-foreground hover:border-foreground/30 transition-colors cursor-default"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 mr-2" />
                    {skill}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}