import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface Row {
  event_id: string;
  user_id: string;
  username: string | null;
  total_points: number;
  correct_predictions: number;
}

interface Props {
  eventId: string;
  matchIds: string[];
  /** Compact preview shows only the top rows + a header. */
  preview?: boolean;
}

export function EventLeaderboard({ eventId, matchIds, preview = false }: Props) {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [predictionCount, setPredictionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const lbPromise = supabase
        .from("event_leaderboard" as any)
        .select("event_id,user_id,username,total_points,correct_predictions")
        .eq("event_id", eventId)
        .order("total_points", { ascending: false })
        .limit(100);

      const countPromise = matchIds.length
        ? supabase
            .from("predictions")
            .select("id", { count: "exact", head: true })
            .in("match_id", matchIds)
        : Promise.resolve({ count: 0 } as { count: number });

      const [{ data }, { count }] = await Promise.all([lbPromise, countPromise]);
      if (cancelled) return;
      setRows((data as unknown as Row[]) ?? []);
      setPredictionCount(count ?? 0);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId, matchIds]);

  const visibleRows = preview ? rows.slice(0, 5) : rows;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
            <Trophy className="h-3.5 w-3.5" /> Predictors
          </div>
          <div className="mt-1 text-2xl font-display font-bold">{rows.length}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
            <Target className="h-3.5 w-3.5" /> Predictions
          </div>
          <div className="mt-1 text-2xl font-display font-bold">{predictionCount}</div>
        </Card>
      </div>

      {loading ? (
        <Card className="p-10 text-center text-muted-foreground text-sm">Loading leaderboard…</Card>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center">
          <Trophy className="h-9 w-9 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-display font-semibold mb-1">No points yet</h3>
          <p className="text-sm text-muted-foreground">
            Be the first to predict a match in this event and top the board.
          </p>
        </Card>
      ) : (
        <Card className="divide-y divide-border overflow-hidden shadow-card">
          {visibleRows.map((r, i) => {
            const isMe = user?.id === r.user_id;
            return (
              <div key={r.user_id} className={cn(
                "flex items-center gap-3 px-4 py-3",
                i === 0 && "bg-yellow-500/5",
                isMe && "bg-primary/5"
              )}>
                <div className="w-7 shrink-0 text-center">
                  {i < 3 ? (
                    <Medal className={cn("h-4 w-4 inline",
                      i === 0 && "text-yellow-500",
                      i === 1 && "text-zinc-400",
                      i === 2 && "text-amber-700"
                    )} />
                  ) : (
                    <span className="text-xs font-mono text-muted-foreground">{i + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm truncate block">
                    {r.username || "Player"}
                    {isMe && <span className="ml-1.5 text-[10px] text-primary font-bold">you</span>}
                  </span>
                  <span className="text-xs text-muted-foreground">{r.correct_predictions} correct</span>
                </div>
                <div className="font-display font-bold text-sm shrink-0">{r.total_points} pts</div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
