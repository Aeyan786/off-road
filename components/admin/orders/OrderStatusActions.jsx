"use client";

import { useState, useTransition } from "react";
import { Ban, CheckCheck, Loader2, Lock, Truck } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cancelOrder, deliverOrder, shipOrder } from "@/actions/orders";
import { allowedActions, formatOrderNumber } from "@/lib/order-status";
import { cn } from "@/lib/utils";

const ACTION_BUTTON = "cursor-pointer rounded-sm px-2.5 text-xs";

/** Pending -> Shipped: nothing changes until a tracking number is confirmed. */
function ShipDialog({ order, compact }) {
  const [open, setOpen] = useState(false);
  const [tracking, setTracking] = useState("");
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function submit(event) {
    event.preventDefault();
    if (!tracking.trim()) {
      setError("Enter the tracking number.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await shipOrder(order.id, tracking);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setTracking("");
      toast.success(`Order ${formatOrderNumber(order.order_number)} marked as shipped.`);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger
        render={
          <Button type="button" size="sm" className={ACTION_BUTTON}>
            <Truck className="size-3.5" />
            {compact ? "Ship" : "Mark as shipped"}
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Ship order {formatOrderNumber(order.order_number)}</DialogTitle>
            <DialogDescription>
              Enter the courier&apos;s tracking number. The order is only marked as
              shipped once you confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor={`tracking-${order.id}`}>Tracking number</Label>
            <Input
              id={`tracking-${order.id}`}
              value={tracking}
              onChange={(event) => setTracking(event.target.value)}
              maxLength={100}
              autoFocus
              aria-invalid={error ? true : undefined}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" className="cursor-pointer rounded-sm px-3" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer rounded-sm px-3" disabled={isPending || !tracking.trim()}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Confirm &amp; mark shipped
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Confirmation for the two final transitions: delivered and cancelled. */
function ConfirmFinalDialog({ order, kind, compact }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const cancel = kind === "cancel";
  const number = formatOrderNumber(order.order_number);

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = cancel ? await cancelOrder(order.id) : await deliverOrder(order.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success(`Order ${number} ${cancel ? "cancelled" : "marked as delivered"}.`);
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            size="sm"
            variant={cancel ? "outline" : "default"}
            className={cn(ACTION_BUTTON, cancel && "text-destructive hover:bg-destructive/10 hover:text-destructive")}
          >
            {cancel ? <Ban className="size-3.5" /> : <CheckCheck className="size-3.5" />}
            {cancel ? "Cancel" : compact ? "Delivered" : "Mark as delivered"}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {cancel ? `Cancel order ${number}?` : `Mark order ${number} as delivered?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {cancel
              ? "The order will be marked as cancelled and its items returned to stock. The payment is not refunded automatically — issue any refund from your Stripe dashboard."
              : `Confirm that the customer has received this order (tracking ${order.tracking_number}).`}{" "}
            <strong>This is final — the order&apos;s status can&apos;t be changed afterwards.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer rounded-sm px-3 text-xs">
            Keep as is
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant={cancel ? "destructive" : "default"}
            className="cursor-pointer rounded-sm px-3 text-xs"
            onClick={confirm}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {cancel ? "Cancel order" : "Mark as delivered"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * The next steps an order allows; delivered/cancelled orders are locked and
 * show no actions (the database refuses changes to them anyway).
 */
export default function OrderStatusActions({ order, compact = false }) {
  const actions = allowedActions(order.status);

  if (actions.isFinal) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-neutral-400" title="Final status — no further changes">
        <Lock className="size-3" />
        Final
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {actions.ship ? <ShipDialog order={order} compact={compact} /> : null}
      {actions.deliver ? <ConfirmFinalDialog order={order} kind="deliver" compact={compact} /> : null}
      {actions.cancel ? <ConfirmFinalDialog order={order} kind="cancel" compact={compact} /> : null}
    </div>
  );
}
