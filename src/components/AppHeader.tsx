import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveDot } from "@/components/pixel/PixelIcon";
import { SovrnMark } from "@/components/pixel/SovrnMark";
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { worldStatsQuery } from "@/lib/api/world";

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
  const { data: stats, isPending } = useQuery(worldStatsQuery);
  const offline = !isPending && !stats;
  return (
    <>
    <div className="h-[102px] shrink-0 lg:hidden" aria-hidden />
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-background lg:sticky">
      <div className="mx-auto grid h-14 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 lg:flex lg:gap-6">
        <Link to="/" className="flex h-11 min-w-0 shrink-0 items-center gap-2" aria-label="SOVRN home">
          <SovrnMark />
          <span className="caps text-foreground">SOVRN</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden min-w-0 items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="caps inline-flex min-h-11 shrink-0 items-center whitespace-nowrap border border-transparent px-2.5 text-muted-foreground hover:text-foreground"
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
              <SheetTitle className="flex items-center gap-2 text-foreground"><SovrnMark /><span className="caps">SOVRN</span></SheetTitle>
              <SheetDescription className="sr-only">Main navigation</SheetDescription>
              <nav aria-label="Mobile navigation" className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                {NAV.map(n => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="caps flex min-h-12 shrink-0 items-center border border-transparent px-4 text-muted-foreground hover:text-foreground" activeProps={{ className: "!border-foreground bg-surface-2 !text-foreground", "aria-current": "page" }} activeOptions={{ exact: true }}>{n.label}</Link>)}
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
          <span className="flex h-11 shrink-0 items-center gap-2"><LiveDot tone={offline ? "danger" : "live"} />{stats?.world.label ?? "World"} · {stats?.world.status === "ended" ? "Ended" : "Live"}</span>
          <span className="px-1 text-text-mute" aria-hidden>·</span>
          <span className="flex h-11 shrink-0 items-center tabular-nums">Turn {stats?.turn ?? "—"}</span>
          <span className="px-1 text-text-mute" aria-hidden>·</span>
          <span className="flex h-11 shrink-0 items-center gap-1.5">POL<span className="hidden lg:inline">in play</span><span className="font-mono tabular-nums text-foreground">{stats?.polInPlay.amount.toLocaleString("en-US") ?? "—"}</span></span>
          <span className="px-1 text-text-mute" aria-hidden>·</span>
          <span className="flex h-11 shrink-0 items-center gap-1.5">Top aim <span className="text-foreground">{stats?.topAim ? `$${stats.topAim}` : "—"}</span></span>
          {offline && <span className="ml-auto shrink-0 border border-[var(--gold)]/50 px-2 py-1 text-[10px] uppercase text-[var(--gold)]">Live feed offline</span>}
        </div>
      </div>
    </header>
    </>
  );
}
