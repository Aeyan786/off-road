import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FINAL_STATUSES, ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({ status }) {
  const meta = ORDER_STATUSES[status] ?? { label: status, className: "" };
  return (
    <Badge variant="outline" className={cn("gap-1 rounded-sm", meta.className)}>
      {FINAL_STATUSES.includes(status) ? <Lock className="size-3" /> : null}
      {meta.label}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }) {
  const meta = PAYMENT_STATUSES[status] ?? { label: status, className: "" };
  return (
    <Badge variant="outline" className={cn("rounded-sm", meta.className)}>
      {meta.label}
    </Badge>
  );
}
