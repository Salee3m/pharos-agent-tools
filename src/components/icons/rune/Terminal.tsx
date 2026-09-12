import * as React from "react";

/** Rune Icons (Apache-2.0) — normal/code/terminal.svg */
export const Terminal = React.forwardRef(function Terminal(
  { className, size = 24, strokeWidth = 2, color = "currentColor", ...props },
  ref
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 19H20M4 17L10 11L4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
});
Terminal.displayName = "Terminal";
