import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden radial-gradient-hero">
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-12 gap-12 items-center max-w-6xl">
        <div className="lg:col-span-7 flex flex-col items-start pt-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border/50 shadow-sm mb-10 font-mono text-xs font-semibold text-muted-foreground backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            </span>
            SYSTEM_ONLINE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-[1.1] glow-heading"
          >
            Sirleeem
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-stretch gap-4 mb-8"
          >
            <div className="w-1 bg-foreground rounded-full" />
            <h2 className="text-xl md:text-2xl text-muted-foreground font-mono font-medium py-1">
              AI Engineer <br className="hidden md:block" /> Automation Architect <br className="hidden md:block" /> Network Engineer
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg md:text-xl max-w-xl mb-12 text-muted-foreground leading-relaxed"
          >
            I build intelligent systems that automate workflows, deploy across environments, and interact with real-world systems.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Button size="lg" className="glow-accent font-mono gap-2 group h-14 px-8 text-base shadow-lg" asChild>
              <a href="#projects">
                View Projects
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="font-mono gap-2 h-14 px-8 text-base bg-background/50 backdrop-blur-sm" asChild>
              <a href="#what-i-build">
                <Code2 className="w-4 h-4" />
                Explore Systems
              </a>
            </Button>
          </motion.div>
        </div>

        <div className="lg:col-span-5 hidden lg:block">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative w-full aspect-square rounded-xl border border-border/50 bg-card module-card overflow-hidden flex flex-col"
          >
            <div className="h-8 border-b border-border/50 bg-muted/30 flex items-center px-4 gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <div className="w-2 h-2 rounded-full bg-green-500/50" />
              <div className="ml-2 font-mono text-[10px] text-muted-foreground">sys.log</div>
            </div>
            <div className="flex-1 p-6 font-mono text-xs text-muted-foreground flex flex-col gap-2 overflow-hidden relative">
              <div className="absolute inset-0 bg-grid-small opacity-10 pointer-events-none" />
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex gap-2">
                <span className="text-foreground">{">"}</span> <span>Initializing kernel...</span>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }} className="flex gap-2">
                <span className="text-foreground">{">"}</span> <span>Loading modules [AI, Network, Automations]...</span>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="flex gap-2">
                <span className="text-foreground">{">"}</span> <span>Establishing connection to Hermes... OK</span>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="flex gap-2">
                <span className="text-foreground">{">"}</span> <span>Deploying OpenClaw environment... OK</span>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="flex gap-2">
                <span className="text-foreground">{">"}</span> <span>System ready. Awaiting instructions.</span>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="flex gap-2 mt-auto">
                <span className="text-foreground">{">"}</span> <span className="w-2 h-4 bg-foreground animate-pulse" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}