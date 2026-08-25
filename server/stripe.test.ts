import { describe, expect, it } from "vitest";
import type { User } from "../drizzle/schema";
import { buildCheckoutSessionParams } from "./stripe";

const user: User = {
  id: 12,
  openId: "stripe-test-user",
  name: "BMR Test User",
  email: "test@example.com",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("BMR Stripe checkout configuration", () => {
  it("uses a subscription, safe metadata, promotion codes, and dynamic return URLs", () => {
    const params = buildCheckoutSessionParams(user, "bmr_pro_monthly", "https://bmr.example");

    expect(params).toMatchObject({
      mode: "subscription",
      allow_promotion_codes: true,
      client_reference_id: "12",
      customer_email: "test@example.com",
      metadata: { user_id: "12", product_id: "bmr_pro_monthly" },
      success_url: "https://bmr.example/?checkout=success&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://bmr.example/?checkout=cancelled",
    });
    expect(params.line_items?.[0]?.price_data?.unit_amount).toBe(1900);
  });
});
