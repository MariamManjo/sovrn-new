import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { PixelIcon, type PixelSprite } from "@/components/pixel/PixelIcon";

export function PlaceholderPage({ title, icon, note }: { title: string; icon: PixelSprite; note: string }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="pixel-panel pixel-dither bg-card p-10">
        <div className="flex items-center gap-4">
          <PixelIcon name={icon} scale={5} />
          <div>
            <Badge className="mb-2 rounded-none border-2 border-ink bg-ash font-pixel text-[10px] uppercase text-ink">
              Placeholder · not built yet
            </Badge>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{note}</p>
          </div>
        </div>
        <Link to="/" className="mt-6 inline-block font-pixel text-xs uppercase text-primary hover:underline">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
