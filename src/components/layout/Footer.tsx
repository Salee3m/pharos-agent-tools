import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * Exact free block: shadcnstudio Footer 11
 * https://shadcnstudio.com/preview/blocks/base/marketing-ui/footer-component/footer-component-11
 * Markup/classes/assets match the free block RSC tree.
 * Links + signature text personalized for Sirleeem.
 */
const socials = [
  {
    label: "GitHub",
    href: "https://github.com/Sirleeem",
    src: "/footer11/github-logo.png",
  },
  {
    label: "Email",
    href: "mailto:Sirleeem101@gmail.com",
    src: "/footer11/gmail.png",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/isah-muhammad-16140b382",
    src: "/footer11/linkedin.png",
  },
  {
    label: "X",
    href: "https://twitter.com/SaleemLabs",
    src: "/footer11/twitter.png",
  },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <div className="flex items-center gap-3">
            {socials.map(({ label, href, src }) => (
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
                  <img
                    src={src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className={
                      label === "GitHub" || label === "X"
                        ? "size-4 dark:invert"
                        : "size-4"
                    }
                  />
                </a>
              </Button>
            ))}
          </div>
          <Separator className="flex-1" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-center sm:ml-8">
          <p className="text-muted-foreground">Thank you, for visiting here</p>
          <img
            src="/footer11/seal.png"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="max-sm:hidden sm:size-[6.25rem]"
          />
          <p className="text-muted-foreground">
            Let&apos;s create something beautiful
          </p>
        </div>

        <div className="space-y-1 text-center">
          <img
            src="/footer11/signature.png"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="mx-auto -mb-6 w-60"
          />
          <p className="text-xs">
            @sirleeem {year}
          </p>
        </div>
      </div>
    </footer>
  );
}
