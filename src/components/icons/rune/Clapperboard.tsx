import * as React from "react";

/** Rune Icons (Apache-2.0) — normal/playback/clapperboard.svg */
export const Clapperboard = React.forwardRef(function Clapperboard(
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
      <path d="M12.2959 3.46411L15.3159 7.42011M2.99995 11L20.2 5.99995L19.4 3.39995C19.1 2.39995 18 1.79995 16.9 2.09995L3.39995 6.09995C2.39995 6.39995 1.79995 7.49995 2.09995 8.59995L2.99995 11ZM2.99995 11L21 11V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19L2.99995 11ZM6.17993 5.27588L9.27993 9.17488" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
});
Clapperboard.displayName = "Clapperboard";
