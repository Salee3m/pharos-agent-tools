import { TerminalSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-12 bg-background">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl">
        <div className="flex items-center gap-3 text-muted-foreground group">
          <div className="w-8 h-8 rounded-lg bg-secondary border flex items-center justify-center">
            <TerminalSquare className="w-4 h-4" />
          </div>
          <span className="font-mono text-sm tracking-tight font-medium">sirleeem.sys © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-mono font-semibold text-foreground/80">STATUS: ONLINE</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <span className="text-xs font-mono font-semibold text-foreground/80">LATENCY: 12ms</span>
        </div>
      </div>
    </footer>
  );
}