/** Lightweight ID-card stand-in for Hero 44 lanyard (no Three.js GLB). */
export function HeroIdCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none relative mx-auto mt-10 w-full max-w-[17rem] drop-shadow-xl max-lg:hidden lg:absolute lg:top-8 lg:right-0 lg:left-auto lg:z-0 lg:mt-0 lg:w-[min(100%,18rem)] ${className}`}
      aria-hidden
    >
      <div className="mx-auto flex flex-col items-center justify-start">
        <div className="h-14 w-1.5 rounded-full bg-gradient-to-b from-muted-foreground/40 to-muted-foreground/10" />
        <div className="mb-2 size-3 rounded-full border-2 border-muted-foreground/50 bg-card" />

        <div className="card-machined w-full overflow-hidden border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              ID · SYS
            </span>
            <span className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          </div>
          <div className="flex flex-col items-center gap-4 px-6 py-8">
            <div className="flex size-24 items-center justify-center rounded-full border bg-foreground text-3xl font-bold text-background">
              S
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold tracking-tight">Sirleeem</div>
              <div className="text-sm text-muted-foreground">Builder · AI · Web</div>
            </div>
            <div className="w-full space-y-1.5 border-t pt-4 font-mono text-[10px] text-muted-foreground">
              <div className="flex justify-between gap-4">
                <span>STATUS</span>
                <span className="text-foreground">ONLINE</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>LOC</span>
                <span className="text-foreground">NG · Remote</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>STACK</span>
                <span className="text-foreground">React · CF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
