import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { PixelIcon, type PixelSprite } from "@/components/pixel/PixelIcon";

export function PlaceholderPage({ title, icon, note }: { title: string; icon: PixelSprite; note: string }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="hud-grid border bg-card p-10">
        <div className="flex items-center gap-4">
          <PixelIcon name={icon} scale={5} />
          <div>
            <Badge variant="outline" className="mb-2 rounded-sm font-mono text-[10px] uppercase">
              Placeholder · not built yet
            </Badge>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{note}</p>
          </div>
        </div>
        <Link to="/" className="mt-6 inline-block font-mono text-xs uppercase text-primary hover:underline">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
