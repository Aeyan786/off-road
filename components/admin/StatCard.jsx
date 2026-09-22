import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONES = {
  default: "text-brand",
  warning: "text-amber-500",
  danger: "text-destructive",
};

/**
 * Summary figure for the top of admin listing pages. Same header layout as
 * the dashboard cards (muted title, icon on the right).
 *
 * @param {string} title
 * @param {React.ReactNode} value
 * @param {string} [hint] small supporting line under the value
 * @param {React.ComponentType} icon lucide icon
 * @param {"default"|"warning"|"danger"} [tone] icon colour
 */
export default function StatCard({ title, value, hint, icon: Icon, tone = "default" }) {
  return (
    <Card className="rounded-sm gap-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-neutral-500">{title}</CardTitle>
        {Icon ? <Icon className={cn("size-4", TONES[tone])} /> : null}
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-bold tabular-nums text-neutral-900">{value}</p>
        {hint ? <p className="text-xs text-neutral-500">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
