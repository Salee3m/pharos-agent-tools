import { useEffect, useState } from "react";

const WORDS = [
  "Hello",
  "नमस्ते",
  "你好",
  "Ciao",
  "Sannu",
  "Báwo ni",
  "Ndewo",
] as const;

/** Hero 44 rotating greeting word (free shadcnstudio hero-section-44). */
export function GreetingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % WORDS.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="mr-2 inline-grid overflow-hidden align-bottom">
      {WORDS.map((w) => (
        <span
          key={`m-${w}`}
          className="invisible col-start-1 row-start-1 whitespace-nowrap"
          aria-hidden
        >
          {w}
        </span>
      ))}
      {WORDS.map((w, i) => (
        <span
          key={w}
          className="col-start-1 row-start-1 inline-block whitespace-nowrap transition-all duration-500"
          style={{
            opacity: i === index ? 1 : 0,
            transform: i === index ? "translateY(0)" : "translateY(110%)",
          }}
          aria-hidden={i !== index}
        >
          {w}
        </span>
      ))}
    </span>
  );
}
