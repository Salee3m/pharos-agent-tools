import { Github, Linkedin, Mail, TerminalSquare } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { Separator } from "@/components/ui/separator";

const navLinks = [
  { title: "Work", href: "#work" },
  { title: "Build", href: "#build" },
  { title: "Email", href: "mailto:Sirleeem101@gmail.com" },
] as const;

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/Sirleeem",
    icon: Github,
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
  {
    label: "Email",
    href: "mailto:Sirleeem101@gmail.com",
    icon: Mail,
  },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="border-t bg-background">
      {/* free footer-component-01: brand · nav · socials */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8">
        <a
          href="#"
          className="flex items-center gap-2.5"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
            <TerminalSquare className="size-4 text-background" />
          </div>
          <span className="text-lg font-semibold tracking-tight">sirleeem</span>
        </a>

        <div className="flex items-center gap-5 whitespace-nowrap text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <a
              key={link.title}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.title}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {socials.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
              aria-label={label}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="size-5" />
            </a>
          ))}
        </div>
      </div>

      <Separator />

      <div className="mx-auto flex max-w-6xl justify-center px-4 py-6 sm:px-6 sm:py-8">
        <p className="text-center text-sm font-medium text-balance text-muted-foreground">
          {`©${year}`}{" "}
          <a href="mailto:Sirleeem101@gmail.com" className="text-foreground hover:underline">
            Sirleeem
          </a>
          {" · "}built to ship
        </p>
      </div>
    </footer>
  );
}
