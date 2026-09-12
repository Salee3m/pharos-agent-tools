import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: ReactNode;
  className?: string;
  duration?: string;
  pauseOnHover?: boolean;
};

/** Horizontal marquee — Hero 44 / free marquee block pattern. */
export function Marquee({
  children,
  className,
  duration = "25s",
  pauseOnHover = true,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden p-3",
        "gap-[var(--marquee-gap,2rem)]",
        className
      )}
      style={
        {
          "--marquee-duration": duration,
          "--marquee-gap": "2rem",
        } as CSSProperties
      }
    >
      <div
        className={cn(
          "flex shrink-0 flex-row justify-around gap-[var(--marquee-gap,2rem)]",
          "animate-marquee-horizontal",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 flex-row justify-around gap-[var(--marquee-gap,2rem)]",
          "animate-marquee-horizontal",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        aria-hidden
      >
        {children}
      </div>
    </div>
  );
}
