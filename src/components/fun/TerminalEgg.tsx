import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Line = { kind: "in" | "out" | "sys"; text: string };

const HELP = [
  "commands: help · whoami · stack · projects · ping · theme · clear · exit",
  "tip: press ` anywhere to toggle this terminal",
].join("\n");

const PROJECTS = [
  "salimtechnology.com",
  "tools.salimtechnology.com",
  "sms.salimtechnology.com",
  "pharosguard.xyz",
].join("\n");

function runCommand(raw: string, toggleTheme: () => void): string[] {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return [];
  if (cmd === "help" || cmd === "?") return [HELP];
  if (cmd === "whoami") return ["sirleeem — builder · ai · web · infra"];
  if (cmd === "stack")
    return ["react · typescript · tailwind · shadcn · workers · fastapi-of-soul: none"];
  if (cmd === "projects" || cmd === "ls") return [PROJECTS];
  if (cmd === "ping") return ["pong  ·  latency: 12ms  ·  status: online"];
  if (cmd === "theme") {
    toggleTheme();
    return ["theme toggled"];
  }
  if (cmd === "clear" || cmd === "cls") return ["__CLEAR__"];
  if (cmd === "exit" || cmd === "quit" || cmd === ":q") return ["__EXIT__"];
  if (cmd === "sudo" || cmd.startsWith("sudo "))
    return ["nice try. this terminal has no root — only ship."];
  if (cmd === "matrix" || cmd === "hack")
    return ["access denied. try building something instead."];
  if (cmd === "coffee" || cmd === "tea")
    return ["brewing… done. productivity +1"];
  return [`command not found: ${raw.trim()}  ·  type help`];
}

export function TerminalEgg({
  open,
  onOpenChange,
  onToggleTheme,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onToggleTheme: () => void;
}) {
  const [lines, setLines] = useState<Line[]>([
    { kind: "sys", text: "sirleeem.sys — interactive shell" },
    { kind: "sys", text: 'type "help" or press Esc to close' },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => inputRef.current?.focus());
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, open]);

  const submit = useCallback(() => {
    const value = input;
    setInput("");
    setLines((prev) => [...prev, { kind: "in", text: `> ${value}` }]);
    const out = runCommand(value, onToggleTheme);
    if (out.includes("__CLEAR__")) {
      setLines([{ kind: "sys", text: "cleared" }]);
      return;
    }
    if (out.includes("__EXIT__")) {
      onOpenChange(false);
      return;
    }
    if (out.length) {
      setLines((prev) => [
        ...prev,
        ...out.map((text) => ({ kind: "out" as const, text })),
      ]);
    }
  }, [input, onOpenChange, onToggleTheme]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-label="Terminal"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        aria-label="Close terminal"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 flex max-h-[min(70vh,520px)] w-full max-w-xl flex-col overflow-hidden rounded-xl border bg-card shadow-2xl card-machined">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
          <span className="size-2.5 rounded-full bg-red-500/70" />
          <span className="size-2.5 rounded-full bg-yellow-500/70" />
          <span className="size-2.5 rounded-full bg-green-500/70" />
          <span className="ml-2 font-mono text-[11px] text-muted-foreground">
            sirleeem — bash
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-7"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-3.5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-3 py-3 font-mono text-xs leading-relaxed sm:text-[13px]">
          {lines.map((line, i) => (
            <pre
              key={i}
              className={
                line.kind === "in"
                  ? "whitespace-pre-wrap text-foreground"
                  : line.kind === "sys"
                    ? "whitespace-pre-wrap text-muted-foreground"
                    : "whitespace-pre-wrap text-foreground/85"
              }
            >
              {line.text}
            </pre>
          ))}
          <div ref={bottomRef} />
        </div>

        <form
          className="flex items-center gap-2 border-t px-3 py-2 font-mono text-xs sm:text-[13px]"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <span className="text-foreground">{">"}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onOpenChange(false);
            }}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60"
            placeholder="help"
            autoComplete="off"
            spellCheck={false}
            aria-label="Terminal input"
          />
        </form>
      </div>
    </div>
  );
}
