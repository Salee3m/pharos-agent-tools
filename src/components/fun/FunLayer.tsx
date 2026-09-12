import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { TerminalEgg } from "@/components/fun/TerminalEgg";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** Global fun layer: ` key + konami opens terminal; listens for open-terminal. */
export function FunLayer() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("sirleeem:open-terminal", onOpen);
    return () => window.removeEventListener("sirleeem:open-terminal", onOpen);
  }, []);

  useEffect(() => {
    let buf: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);

      if (e.key === "`" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (typing && !open) return;
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }

      if (open) return;

      buf = [...buf, e.key].slice(-KONAMI.length);
      if (
        buf.length === KONAMI.length &&
        buf.every((k, i) => k === KONAMI[i])
      ) {
        setOpen(true);
        buf = [];
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <TerminalEgg
      open={open}
      onOpenChange={setOpen}
      onToggleTheme={toggleTheme}
    />
  );
}

export function openTerminal() {
  window.dispatchEvent(new Event("sirleeem:open-terminal"));
}
