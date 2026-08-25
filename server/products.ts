/**
 * BMR AI CHATBOART offers. Keep the commercial configuration in one place so live Stripe Price IDs can replace the proposed test price without touching checkout logic.
 */
import type Stripe from "stripe";

export const BMR_PRO_MONTHLY = {
  id: "bmr_pro_monthly",
  name: "BMR Pro",
  description: "Guided workboards, reusable outcome templates, voice-enabled intake, and review-first planning for independent professionals and small teams.",
  displayPrice: "$19/month",
  priceData: {
    currency: "usd",
    unit_amount: 1900,
    recurring: { interval: "month" as const },
    product_data: {
      name: "BMR Pro",
      description: "Monthly BMR AI CHATBOART Pro workspace subscription",
    },
  } satisfies Stripe.Checkout.SessionCreateParams.LineItem.PriceData,
} as const;

export const BMR_PRODUCTS = {
  [BMR_PRO_MONTHLY.id]: BMR_PRO_MONTHLY,
} as const;

export type BmrProductId = keyof typeof BMR_PRODUCTS;
