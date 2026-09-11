import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const socials = [
  { label: "GitHub", href: "https://github.com/Sirleeem", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/isah-muhammad-16140b382", icon: Linkedin },
  { label: "X", href: "https://twitter.com/SaleemLabs", icon: FaXTwitter },
] as const;

export function Contact() {
  return (
    <section id="contact" className="py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-none bg-muted shadow-sm card-machined">
            <CardContent className="flex flex-col items-start justify-between gap-8 px-6 py-10 sm:flex-row sm:items-center sm:px-10 sm:py-14 lg:px-14">
              <div className="max-w-lg space-y-3">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Let&apos;s build something
                </h2>
                <p className="text-muted-foreground">
                  Open for products, agents, and infrastructure work.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
                <Button size="lg" className="h-12 w-full gap-2 px-6 font-mono sm:w-auto" asChild>
                  <a href="mailto:Sirleeem101@gmail.com">
                    <Mail className="size-4" />
                    Sirleeem101@gmail.com
                  </a>
                </Button>
                <div className="flex items-center gap-2">
                  {socials.map(({ label, href, icon: Icon }) => (
                    <Button key={label} variant="outline" size="icon" className="rounded-md" asChild>
                      <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
                        <Icon className="size-4" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
