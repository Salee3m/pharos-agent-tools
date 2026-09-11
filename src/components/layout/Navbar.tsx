import { Menu, Moon, Sun, TerminalSquare } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { title: "Work", href: "#work" },
  { title: "Build", href: "#build" },
  { title: "Contact", href: "#contact" },
] as const;

export function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <button
          type="button"
          className="flex items-center gap-2.5 group"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="flex size-8 items-center justify-center rounded-md bg-foreground transition-transform group-hover:scale-105">
            <TerminalSquare className="size-4 text-background" />
          </div>
          <span className="font-mono text-sm font-bold tracking-tight">sirleeem</span>
        </button>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.title}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-md"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="size-4 text-muted-foreground" />
            ) : (
              <Moon className="size-4 text-muted-foreground" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-md md:hidden">
                <Menu className="size-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {links.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <a href={link.href}>{link.title}</a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
