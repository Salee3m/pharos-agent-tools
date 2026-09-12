import { Github, Linkedin, Mail } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * Free shadcnstudio Footer 11 (marketing-ui/footer-component-11)
 * Socials on horizontal rules → thank-you lines → script signature → @handle year
 */
const socials = [
  { label: "GitHub", href: "https://github.com/Sirleeem", icon: Github },
  { label: "Email", href: "mailto:Sirleeem101@gmail.com", icon: Mail },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/isah-muhammad-16140b382",
    icon: Linkedin,
  },
  { label: "X", href: "https://twitter.com/SaleemLabs", icon: FaXTwitter },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-background py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:space-y-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <div className="flex items-center gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <Button
                key={label}
                variant="outline"
                size="icon"
                className="size-10 shrink-0 rounded-md"
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

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-center">
          <p className="text-muted-foreground">Thank you, for visiting here</p>
          <p className="text-muted-foreground">Let&apos;s create something beautiful</p>
        </div>

        <div className="space-y-3 pt-6 text-center sm:pt-10">
          <p
            className="select-none text-[2.75rem] leading-none tracking-tight text-foreground/80 sm:text-6xl"
            style={{
              fontFamily: '"Caveat", "Segoe Script", "Bradley Hand", cursive',
              fontWeight: 600,
            }}
            aria-hidden="true"
          >
            Sirleeem
          </p>
          <p className="text-xs text-muted-foreground">
            @sirleeem {year}
          </p>
        </div>
      </div>
    </footer>
  );
}
