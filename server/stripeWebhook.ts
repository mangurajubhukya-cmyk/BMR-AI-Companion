/** Secure Stripe webhook endpoint. It verifies signatures and stores no raw card, payment, or webhook payload data. */
import express, { type Express, type Request, type Response } from "express";
import { verifyStripeEvent } from "./stripe";

export function registerStripeWebhook(app: Express) {
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req: Request, res: Response) => {
    try {
      const signature = req.headers["stripe-signature"];
      const event = verifyStripeEvent(req.body as Buffer, typeof signature === "string" ? signature : undefined);

      if (event.id.startsWith("evt_test_")) {
        console.log("[Stripe webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Stripe webhook] Received ${event.type} (${event.id})`);
      // Stripe remains the source of truth for subscription, invoice, and payment status.
      // Future fulfillment logic can use metadata.user_id without persisting sensitive payment details.
      return res.json({ received: true });
    } catch (error) {
      console.error("[Stripe webhook] Signature verification failed", error);
      return res.status(400).send("Webhook Error");
    }
  });
}
