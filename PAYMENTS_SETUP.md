# BMR Pro Payments Setup

## What users can buy

The first paid offer is **BMR Pro**, a monthly subscription currently configured at **$19 USD per month** for testing. It is positioned as access to guided Client Win, Content-to-Lead, and Customer Reply workboards; reusable templates; voice-enabled intake; and review-first planning. It is not sold as a promise of earnings, investing performance, client acquisition, or business results.

## Checkout behavior

An authenticated user selects **Unlock BMR Pro** from a new workboard. The application creates a Stripe Checkout Session on the server, passes only the hosted Checkout URL to the browser, and opens it in a new tab. The browser never receives Stripe secret keys, webhook secrets, or card data.

The checkout request carries the authenticated user’s ID and basic account metadata so a later fulfillment workflow can be associated with the right user. Stripe remains the source of truth for payment, invoice, and subscription status; the application does not store card numbers, card details, raw webhook bodies, or Stripe credentials.

## Test the sandbox

1. Open **Settings → Payment** and claim the project’s Stripe test sandbox.
2. In BMR AI CHATBOART, sign in, start a new chat, and select **Unlock BMR Pro**.
3. Stripe Checkout should open in a new tab. Use the Stripe test card `4242 4242 4242 4242` with any valid future expiry date, CVC, and postal code.
4. Complete the test checkout. Stripe redirects back to BMR with `?checkout=success`.
5. In the Stripe Dashboard, confirm the Checkout Session and subscription. The webhook endpoint is `/api/stripe/webhook`.

## Enable subscription management

In **Stripe Dashboard → Settings → Billing → Customer portal**, configure the sandbox portal before testing BMR Pro management. Enable cancellation, billing history, payment method updates, and—if you introduce more than one plan—the product catalog users may switch between. After Stripe sends a real `checkout.session.completed` webhook, BMR stores only the Stripe customer ID. The profile’s **Manage or cancel plan** button then creates a short-lived, authenticated portal session for that customer.

## Before accepting real payments

Confirm the final price, currency, tax treatment, refund terms, cancellation terms, and which Pro features are actually available. Then replace the test product configuration in `server/products.ts` with a live Stripe Price ID or confirmed live pricing, complete Stripe verification, and enter live keys through **Settings → Payment**. Test first in sandbox; do not treat the $19 test configuration as a final commercial decision.
