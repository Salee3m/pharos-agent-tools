import type { ComponentType } from "react";
import { ArrowRight, Boxes, Cloud, TerminalSquare, Workflow } from "lucide-react";
import {
  SiCloudflare,
  SiFastapi,
  SiGithub,
  SiLinux,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVite,
} from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { GreetingWord } from "@/components/sections/GreetingWord";
import { HeroIdCard } from "@/components/sections/HeroIdCard";
import { openTerminal } from "@/components/fun/FunLayer";

/**
 * Free shadcnstudio Hero 44 layout
 * https://shadcnstudio.com/preview/blocks/base/marketing-ui/hero-section/hero-section-44
 */
const MARQUEE: { label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { label: "React", Icon: SiReact },
  { label: "TypeScript", Icon: SiTypescript },
  { label: "Tailwind", Icon: SiTailwindcss },
  { label: "Vite", Icon: SiVite },
  { label: "Cloudflare", Icon: SiCloudflare },
  { label: "Workers", Icon: Cloud },
  { label: "Python", Icon: SiPython },
  { label: "FastAPI", Icon: SiFastapi },
  { label: "Node", Icon: SiNodedotjs },
  { label: "Linux", Icon: SiLinux },
  { label: "GitHub", Icon: SiGithub },
  { label: "shadcn", Icon: Boxes },
  { label: "Hermes", Icon: Workflow },
  { label: "Terminal", Icon: TerminalSquare },
];

export function Hero() {
  return (
    <section className="lg:relative">
      <div className="max-sm:pt-20 sm:py-16 lg:pt-32 lg:pb-24">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Copy stays above the card */}
          <div className="relative z-20 space-y-6 lg:max-w-lg lg:pr-4">
            <button
              type="button"
              onClick={() => openTerminal()}
              className="bg-card inline-flex h-6.5 w-fit items-center justify-center gap-1 overflow-visible rounded-full border px-2.5 text-sm whitespace-nowrap text-green-600 dark:text-green-400"
              title="Open terminal"
            >
              <span className="relative inline-flex size-1.5">
                <span className="absolute -inset-0.5 animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-green-600/40 opacity-75 dark:bg-green-400/40" />
                <span className="relative inline-flex size-1.5 rounded-full bg-green-600 dark:bg-green-400" />
              </span>
              Available
            </button>

            <h1 className="mb-2 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[64px] lg:font-bold">
              <GreetingWord />
              I am Sirleeem 👋🏻
            </h1>

            <p className="text-muted-foreground text-xl font-medium sm:text-2xl lg:text-3xl">
              Builder · AI Engineer
            </p>

            <p className="text-muted-foreground mb-8 max-w-2xl text-base">
              I ship live products — web apps, AI agents, and cloud systems.
              From first sketch to production deploy.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Button
                variant="outline"
                className="h-11 rounded-full px-4 text-base"
                asChild
              >
                <a href="#work">View work</a>
              </Button>

              <Button
                variant="outline"
                className="group bg-card hover:bg-card h-11 gap-2.5 rounded-full pr-4 pl-4 text-base shadow-sm transition-[padding] duration-300 hover:pl-2"
                asChild
              >
                <a href="#footer">
                  <span className="bg-primary relative flex size-2.5 items-center justify-center overflow-hidden rounded-full transition-all duration-300 group-hover:size-6.5">
                    <ArrowRight className="text-primary-foreground absolute size-4 -translate-x-3 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </span>
                  Let&apos;s connect
                </a>
              </Button>
            </div>
          </div>

          <HeroIdCard />
        </div>

        <div className="relative z-10 mx-auto mt-10 mb-10 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-[1] w-16 bg-gradient-to-r to-transparent sm:w-35" />
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 bg-gradient-to-l to-transparent sm:w-35" />
          <div className="mx-auto w-full max-w-5xl overflow-hidden">
            <Marquee>
              {MARQUEE.map(({ label, Icon }) => (
                <div
                  key={label}
                  title={label}
                  className="bg-muted flex size-16 shrink-0 items-center justify-center rounded-md"
                >
                  <Icon className="size-7 text-foreground/80" aria-hidden />
                  <span className="sr-only">{label}</span>
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  );
}
