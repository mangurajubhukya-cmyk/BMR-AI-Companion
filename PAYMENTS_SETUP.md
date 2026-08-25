# BMR Pro Payments Setup

## What users can buy

| Plan | Price | Capacity shown in BMR | Checkout type |
|---|---:|---|---|
| **Free Trial** | $0 | 10 standard replies each day | No card or Stripe checkout |
| **BMR Credit** | $5/month | 300 BMR credits each month | Stripe monthly subscription |
| **BMR Ultra** | $18/month | 1,500 BMR credits each month | Stripe monthly subscription |

Paid plans are positioned as capacity for guided Client Win, Content-to-Lead, and Customer Reply workflows; reusable templates; and browser-based multilingual input and voice support. They are not sold as a promise of earnings, investing performance, client acquisition, or business results.

## Checkout behavior

An authenticated user selects a tier on the in-app **Plans** screen, reviews it again on an in-app confirmation screen, and then continues to Stripe Checkout in the **same browser tab**. The application creates the Checkout Session on the server and passes only the hosted Checkout URL to the browser. The browser never receives Stripe secret keys, webhook secrets, or card data.

The checkout request carries the authenticated user’s ID and basic account metadata so a later fulfillment workflow can be associated with the right user. Stripe remains the source of truth for payment, invoice, and subscription status; the application does not store card numbers, card details, raw webhook bodies, or Stripe credentials.

## Test the sandbox

1. Open **Settings → Payment** and claim the project’s Stripe test sandbox.
2. In BMR AI CHATBOART, sign in, open **Compare BMR plans**, and choose either **BMR Credit** or **BMR Ultra**.
3. Confirm the selected plan inside BMR. Stripe Checkout should replace the current tab. Use the Stripe test card `4242 4242 4242 4242` with any valid future expiry date, CVC, and postal code.
4. Complete the test checkout. Stripe redirects back to BMR with `?checkout=success`.
5. In the Stripe Dashboard, confirm the Checkout Session and subscription. The webhook endpoint is `/api/stripe/webhook`.

## Enable subscription management

In **Stripe Dashboard → Settings → Billing → Customer portal**, configure the sandbox portal before testing BMR Credit and BMR Ultra management. Enable cancellation, billing history, payment method updates, and plan switching where appropriate. After Stripe sends a real `checkout.session.completed` webhook, BMR stores only the Stripe customer ID. The profile’s **Manage or cancel plan** button then creates a short-lived, authenticated portal session for that customer.

## Before accepting real payments

Confirm the final price, currency, tax treatment, refund terms, cancellation terms, product switching rules, and exactly how BMR credits are metered before accepting live payments. Then replace the test product configuration in `server/products.ts` with confirmed live prices or Stripe Price IDs, complete Stripe verification, and enter live keys through **Settings → Payment**. Test first in sandbox; do not treat these draft capacity limits as final commercial terms.
