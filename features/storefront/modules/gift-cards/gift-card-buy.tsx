"use client";

import { useActionState, useState } from "react";
import { RiLoader2Fill } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { buyGiftCardAction } from "@/features/storefront/lib/data/gift-cards";

export function GiftCardBuy({ amounts, currencyCode, countryCode }: { amounts: number[]; currencyCode: string; countryCode: string }) {
  const money = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode.toUpperCase(), maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
  const [amount, setAmount] = useState(amounts[1] ?? amounts[0]);
  const [forSomeone, setForSomeone] = useState(true);
  const [state, action, pending] = useActionState(buyGiftCardAction, null);
  const choice = (selected: boolean) =>
    cn("h-11 rounded-md border px-4 text-sm font-medium transition-colors", selected ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50");

  return (
    <form action={action} className="flex flex-col gap-y-6">
      <input type="hidden" name="amount" value={amount} />
      <input type="hidden" name="countryCode" value={countryCode} />
      <input type="hidden" name="forSomeone" value={forSomeone ? "yes" : "no"} />
      <fieldset className="flex flex-col gap-y-2">
        <legend className="text-sm font-medium mb-2">Amount</legend>
        <div className="grid grid-cols-3 gap-2">
          {amounts.map((value) => (
            <button key={value} type="button" className={choice(value === amount)} aria-pressed={value === amount} onClick={() => setAmount(value)}>
              {money(value)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-y-2">
        <legend className="text-sm font-medium mb-2">Who is it for</legend>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className={choice(forSomeone)} aria-pressed={forSomeone} onClick={() => setForSomeone(true)}>Send to someone</button>
          <button type="button" className={choice(!forSomeone)} aria-pressed={!forSomeone} onClick={() => setForSomeone(false)}>For me</button>
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="gc-name">Your name</Label>
          <Input id="gc-name" name="purchaserName" required maxLength={120} autoComplete="name" />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="gc-email">Your email</Label>
          <Input id="gc-email" name="purchaserEmail" type="email" required maxLength={254} autoComplete="email" />
        </div>
      </div>
      {forSomeone && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="gc-to-name">Their name</Label>
              <Input id="gc-to-name" name="recipientName" required maxLength={120} />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="gc-to-email">Their email</Label>
              <Input id="gc-to-email" name="recipientEmail" type="email" required maxLength={254} />
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="gc-message">Message (optional)</Label>
            <Textarea id="gc-message" name="message" maxLength={500} rows={3} />
          </div>
        </>
      )}
      {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto sm:self-start">
        {pending && <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />}
        {pending ? "Opening checkout…" : `Buy a ${money(amount)} gift card`}
      </Button>
      <p className="text-sm text-muted-foreground">
        Paid securely with Stripe. The code is emailed {forSomeone ? "to them" : "to you"} as soon as the payment clears. Enter it at checkout; it works for a year and any balance left stays on the card.
      </p>
    </form>
  );
}
