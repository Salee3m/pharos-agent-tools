import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, Terminal } from "lucide-react";
import { FaGithub, FaTwitter } from "react-icons/fa";

export function Contact() {
  return (
    <section id="contact" className="py-32 bg-secondary/30 border-t relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-card border rounded-2xl p-12 md:p-20 shadow-xl overflow-hidden module-card"
        >
          
          <div className="w-16 h-16 rounded-xl bg-background border flex items-center justify-center mx-auto mb-8 relative z-10 shadow-sm">
            <Terminal className="w-8 h-8 text-foreground" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight relative z-10 font-sans">Establish.Connection()</h2>
          
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg leading-relaxed relative z-10">
            Whether you need a complex automation pipeline built, a custom AI agent deployed, or infrastructure secured—my terminal is open.
          </p>

          <p className="font-mono text-sm font-semibold text-foreground mb-10 relative z-10">
            {">"} ready for new deployments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <Button size="lg" className="font-mono gap-3 h-14 px-8 w-full sm:w-auto shadow-lg bg-foreground text-background hover:bg-foreground/90" asChild>
              <a href="mailto:Sirleeem101@gmail.com">
                <Mail className="w-5 h-5" />
                Sirleeem101@gmail.com
              </a>
            </Button>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="w-14 h-14 rounded-xl bg-background border-border hover:bg-secondary transition-colors" asChild>
                <a href="https://github.com/Sirleeem" target="_blank" rel="noreferrer">
                  <FaGithub className="w-6 h-6 text-foreground" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
              <Button variant="outline" size="icon" className="w-14 h-14 rounded-xl bg-background border-border hover:bg-secondary transition-colors" asChild>
                <a href="https://twitter.com/SaleemLabs" target="_blank" rel="noreferrer">
                  <FaTwitter className="w-6 h-6 text-foreground" />
                  <span className="sr-only">X</span>
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}