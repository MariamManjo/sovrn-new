import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PixelIcon } from "@/components/pixel/PixelIcon";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/season", label: "Season map" },
  { to: "/agents", label: "Agents" },
  { to: "/factions", label: "Factions" },
  { to: "/pol", label: "POL" },
  { to: "/launch", label: "Launch" },
] as const;

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-black/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        {/* Logo slot — image wordmark comes later; text wordmark for now */}
        <Link to="/" className="flex items-center gap-2" aria-label="Home">
          <PixelIcon name="flag" scale={3} color="var(--launch)"  />
          <span className="font-pixel text-xs uppercase tracking-widest text-white">
            SOVRN
          </span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="whitespace-nowrap border border-transparent px-2.5 py-1 font-pixel text-xs uppercase text-muted-foreground hover:text-white"
              activeProps={{ className: "!border-line bg-surface-2 !text-white" }}
              activeOptions={{ exact: true }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button size="sm" variant="secondary" disabled className="border-white/60 text-xs uppercase text-white">
                    Connect wallet
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Demo only</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
