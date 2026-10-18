import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoIcon from "@/assets/logo-icon.png.asset.json";
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { agentsQuery } from "@/lib/mock/agents";
import { worldStatsQuery } from "@/lib/mock/api";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/season", label: "World map" },
  { to: "/agents", label: "Agents" },
  { to: "/diplomacy", label: "Diplomacy" },
  { to: "/factions", label: "Factions" },
  { to: "/pol", label: "POL" },
  { to: "/launch", label: "Launch" },
] as const;

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const { data: stats } = useQuery(worldStatsQuery);
  const { data: agents } = useQuery(agentsQuery);
  const director = agents?.find(agent => agent.directsPol);
  return (
    <>
    <div className="h-[102px] shrink-0 lg:hidden" aria-hidden />
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-background lg:sticky">
      <div className="mx-auto grid h-14 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 lg:flex lg:gap-6">
        {/* Logo slot — image wordmark comes later; text wordmark for now */}
        <Link to="/" className="flex h-11 min-w-0 shrink-0 items-center gap-2" aria-label="SOVRN home">
          <img src={logoIcon.url} alt="" width={32} height={32} className="h-8 w-8" style={{ imageRendering: "pixelated" }} />
          <span className="truncate font-pixel text-xs uppercase text-foreground">
            SOVRN
          </span>
        </Link>
        <nav aria-label="Main navigation" className="hidden min-w-0 items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap border border-transparent px-2.5 font-pixel text-xs uppercase text-muted-foreground hover:text-foreground"
              activeProps={{ className: "!border-line bg-surface-2 !text-foreground", "aria-current": "page" }}
              activeOptions={{ exact: true }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 lg:ml-auto">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-11 lg:hidden" aria-label="Open navigation menu"><Menu /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-full max-w-full flex-col border-line bg-background pt-16 sm:max-w-sm [&>button]:top-2 [&>button]:right-3 [&>button]:flex [&>button]:size-11 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-none motion-reduce:animate-none motion-reduce:transition-none">
              <SheetTitle className="font-pixel text-base text-foreground">SOVRN</SheetTitle>
              <SheetDescription className="sr-only">Main navigation</SheetDescription>
              <nav aria-label="Mobile navigation" className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                {NAV.map(n => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="flex min-h-12 shrink-0 items-center border border-transparent px-4 font-pixel text-sm uppercase text-muted-foreground hover:text-foreground" activeProps={{ className: "!border-foreground bg-surface-2 !text-foreground", "aria-current": "page" }} activeOptions={{ exact: true }}>{n.label}</Link>)}
              </nav>
            </SheetContent>
          </Sheet>
          <span tabIndex={0} className="inline-flex min-h-11 items-center">
            <Button size="sm" variant="secondary" disabled className="h-11 border-foreground/60 text-xs uppercase text-foreground">
              <Wallet className="lg:hidden" /><span className="lg:hidden">Wallet</span><span className="hidden lg:inline">Connect wallet</span>
            </Button>
          </span>
        </div>
      </div>
      <div className="border-t border-line bg-surface">
        <div role="region" aria-label="World status" tabIndex={0} className="mx-auto flex h-11 max-w-7xl items-center gap-2 overflow-x-auto overscroll-x-contain whitespace-nowrap px-4 font-sans text-xs text-muted-foreground [scrollbar-width:thin]">
          <span className="flex h-11 shrink-0 items-center gap-2"><span className="size-1.5 shrink-0 bg-alive" aria-hidden />{stats?.world.label ?? "World"} · Live</span>
          <span className="px-1 text-text-mute" aria-hidden>·</span>
          <span className="flex h-11 shrink-0 items-center">Turn 142</span>
          <span className="px-1 text-text-mute" aria-hidden>·</span>
          <span className="flex h-11 shrink-0 items-center gap-1.5">POL<span className="hidden lg:inline">in play</span><span className="tabular-nums text-foreground">{stats?.polInPlay.amount.toLocaleString("en-US") ?? "1,284,500"}</span></span>
          <span className="px-1 text-text-mute" aria-hidden>·</span>
          <span className="flex h-11 shrink-0 items-center gap-1.5">Top aim <span className="text-foreground">${director?.ticker ?? "VSP"}</span></span>
        </div>
      </div>
    </header>
    </>
  );
}
