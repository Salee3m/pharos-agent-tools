import { Github, Linkedin, Mail, TerminalSquare } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/Sirleeem",
    icon: Github,
  },
  {
    label: "Email",
    href: "mailto:Sirleeem101@gmail.com",
    icon: Mail,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/isah-muhammad-16140b382",
    icon: Linkedin,
  },
  {
    label: "X",
    href: "https://twitter.com/SaleemLabs",
    icon: FaXTwitter,
  },
] as const;

function SealMark() {
  return (
    <div
      className="relative hidden size-24 shrink-0 items-center justify-center sm:flex"
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full border border-border/80 bg-card shadow-sm" />
      <div className="absolute inset-1.5 rounded-full border border-dashed border-border/70" />
      <div className="absolute inset-3 rounded-full border border-border/50 bg-background" />
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        <TerminalSquare className="size-5 text-foreground" strokeWidth={1.75} />
        <span className="font-mono text-[9px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          SYS
        </span>
      </div>
    </div>
  );
}

function SignatureMark() {
  return (
    <div
      className="mx-auto -mb-5 flex w-60 select-none flex-col items-center justify-end"
      aria-hidden="true"
    >
      <span
        className="text-[2.75rem] leading-none text-foreground/90"
        style={{
          fontFamily: '"Caveat", "Segoe Script", "Bradley Hand", cursive',
          fontWeight: 600,
        }}
      >
        Sirleeem
      </span>
      <span className="mt-1 h-px w-28 bg-border" />
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <div className="flex items-center gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <Button
                key={label}
                variant="outline"
                size="icon"
                className="rounded-md"
                asChild
              >
                <a
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </a>
              </Button>
            ))}
          </div>
          <Separator className="flex-1" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-center sm:ml-8">
          <p className="text-muted-foreground">Thank you, for visiting here</p>
          <SealMark />
          <p className="text-muted-foreground">Let&apos;s create something beautiful</p>
        </div>

        <div className="space-y-1 text-center">
          <SignatureMark />
          <p className="text-xs text-muted-foreground">
            @sirleeem {year}
          </p>
        </div>
      </div>
    </footer>
  );
}
