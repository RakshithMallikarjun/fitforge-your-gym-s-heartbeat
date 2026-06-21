import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/exercises")({
  component: ExerciseLibrary,
});

function ExerciseLibrary() {
  const { data } = useQuery({
    queryKey: ["exercise-library"],
    queryFn: async () => {
      const { data } = await supabase
        .from("exercises")
        .select("id, name, muscle_group, equipment, video_url, thumbnail_url, difficulty")
        .order("name");
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-md px-5 pt-10">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Library</p>
        <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
      </header>

      {data?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          <PlayCircle className="mx-auto mb-3 h-8 w-8 opacity-40" />
          Exercise library is empty. Ask your trainer to add some.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {data?.map((ex) => (
          <a
            key={ex.id}
            href={ex.video_url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-2xl border border-border/60 bg-gradient-card transition-all hover:border-primary/40"
          >
            <div className="relative aspect-video bg-muted">
              {ex.thumbnail_url ? (
                <img src={ex.thumbnail_url} alt={ex.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center">
                  <PlayCircle className="h-10 w-10 text-muted-foreground/50 transition-colors group-hover:text-primary" />
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold leading-tight">{ex.name}</h3>
              <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                {ex.muscle_group ?? ex.equipment ?? "—"}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
