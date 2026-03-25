import { Coins, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { PointsTransaction } from "@/hooks/usePoints";

interface PointsTransactionListProps {
  transactions: PointsTransaction[];
  showUser?: boolean;
}

const PointsTransactionList = ({ transactions, showUser }: PointsTransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-4 text-center">No transactions yet.</p>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between rounded bg-muted/50 px-3 py-2 text-xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            {tx.action_type === "use" ? (
              <Minus className="h-3.5 w-3.5 text-destructive shrink-0" />
            ) : tx.action_type === "add" ? (
              <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-destructive shrink-0" />
            )}
            <div className="min-w-0">
              <span className="text-foreground font-medium">
                {tx.action_type === "use"
                  ? tx.tool_name || "Tool usage"
                  : tx.action_type === "add"
                  ? "Points added"
                  : "Points deducted"}
              </span>
              {tx.description && (
                <span className="text-muted-foreground ml-1">— {tx.description}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-2">
            <span
              className={`font-heading font-bold ${
                tx.action_type === "add" ? "text-primary" : "text-destructive"
              }`}
            >
              {tx.action_type === "add" ? "+" : "-"}{tx.points_used}
            </span>
            <span className="text-muted-foreground text-[10px] w-16 text-right">
              {new Date(tx.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PointsTransactionList;
