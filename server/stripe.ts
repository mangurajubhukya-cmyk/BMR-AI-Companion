/**
 * Secure server-side Stripe helpers for BMR AI CHATBOART. The browser receives only a hosted Checkout URL, never Stripe credentials or payment secrets.
 */
import type { User } from "../drizzle/schema";
import Stripe from "stripe";
import { BMR_PRODUCTS, type BmrProductId } from "./products";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe is not configured. Update Settings → Payment before accepting purchases.");
  return new Stripe(secretKey);
}

export function getRequestOrigin(req: { get: (name: string) => string | undefined; protocol?: string }) {
  const origin = req.get("origin");
  if (origin) return origin;
  const host = req.get("host");
  if (!host) throw new Error("Could not determine the checkout return URL");
  return `${req.protocol ?? "https"}://${host}`;
}

export function buildCheckoutSessionParams(user: User, productId: BmrProductId, origin: string): Stripe.Checkout.SessionCreateParams {
  const product = BMR_PRODUCTS[productId];
  return {
    mode: "subscription",
    line_items: [{ price_data: product.priceData, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: user.id.toString(),
    customer_email: user.email ?? undefined,
    metadata: {
      user_id: user.id.toString(),
      customer_email: user.email ?? "",
      customer_name: user.name ?? "",
      product_id: productId,
    },
    success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?checkout=cancelled`,
  };
}

export async function createBmrCheckoutSession(user: User, productId: BmrProductId, origin: string) {
  const session = await getStripe().checkout.sessions.create(buildCheckoutSessionParams(user, productId, origin));
  if (!session.url) throw new Error("Stripe did not return a Checkout URL");
  return session.url;
}

export function verifyStripeEvent(rawBody: Buffer, signature: string | undefined) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !signature) throw new Error("Stripe webhook signature is unavailable");
  return getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
}
