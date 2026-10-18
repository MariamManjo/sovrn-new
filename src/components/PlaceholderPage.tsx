import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { PixelIcon, type PixelSprite } from "@/components/pixel/PixelIcon";

export function PlaceholderPage({ title, icon, note }: { title: string; icon: PixelSprite; note: string }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="surface p-10">
        <div className="flex items-center gap-4">
          <PixelIcon name={icon} scale={5} />
          <div>
            <Badge className="mb-2 rounded-none border-2 border-ink bg-panel-2 caps text-text">
              Placeholder · not built yet
            </Badge>
            <h1 className="caps-24">{title}</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{note}</p>
          </div>
        </div>
        <Link to="/" className="mt-6 inline-block font-sans text-sm text-white hover:underline">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
