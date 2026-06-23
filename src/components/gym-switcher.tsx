import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { useGymContext } from "@/hooks/use-gym-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function GymSwitcher() {
  const { activeGym, availableGyms, canSwitchGym, setActiveGymId, loading } =
    useGymContext();

  if (loading) return null;

  // Non-super-admins see a read-only chip
  if (!canSwitchGym) {
    if (!activeGym) return null;
    return (
      <div className="flex items-center gap-2 rounded-full border border-border/40 bg-card/50 px-3 py-1.5 text-sm">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{activeGym.name}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-full border-border/40 bg-card/50"
        >
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[160px] truncate">
            {activeGym?.name ?? "Select gym"}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Switch tenant
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableGyms.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No gyms found.
          </div>
        ) : (
          availableGyms.map((gym) => {
            const active = gym.id === activeGym?.id;
            return (
              <DropdownMenuItem
                key={gym.id}
                onSelect={() => setActiveGymId(gym.id)}
                className="flex items-center justify-between gap-3 py-2"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{gym.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    /{gym.slug}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={gym.is_active ? "secondary" : "outline"}
                    className="text-[10px] uppercase"
                  >
                    {gym.subscription_plan}
                  </Badge>
                  {active && <Check className="h-4 w-4 text-primary" />}
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
