# Stripe Integration Setup Guide

This guide will help you set up Stripe integration for business subscriptions.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Firebase project with Firestore enabled
3. Environment variables configured

## Step 1: Create Stripe Products and Prices

1. Log in to your Stripe Dashboard (https://dashboard.stripe.com)
2. Navigate to **Products** → **Add product**
3. Create two products:

   **Product 1: Single Branch Subscription**
   - Name: "Single Branch Subscription"
   - Pricing: $500.00/month
   - Billing period: Monthly
   - Copy the **Price ID** (starts with `price_`)

   **Product 2: All Branches Subscription**
   - Name: "All Branches Subscription"
   - Pricing: $1,500.00/month
   - Billing period: Monthly
   - Copy the **Price ID** (starts with `price_`)

## Step 2: Get Stripe API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy your **Publishable key** (starts with `pk_test_` for test mode)
3. Copy your **Secret key** (starts with `sk_test_` for test mode)
4. Click **Reveal test key** if needed

## Step 3: Set Up Webhooks

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - For local development, use a tool like [Stripe CLI](https://stripe.com/docs/stripe-cli) or [ngrok](https://ngrok.com)
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
5. Copy the **Signing secret** (starts with `whsec_`)

## Step 4: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs
STRIPE_PRICE_ID_SINGLE=price_your_single_branch_price_id
STRIPE_PRICE_ID_ALL=price_your_all_branches_price_id

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace the placeholder values with your actual Stripe keys and price IDs.

## Step 5: Testing

### Local Development

For local development, use Stripe CLI to forward webhooks:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the webhook signing secret from the CLI output
5. Use test cards from Stripe: https://stripe.com/docs/testing

### Test Cards

Use these test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0027 6000 3184`

Use any future expiry date, any 3-digit CVC, and any ZIP code.

## Step 6: Production Setup

1. Switch to **Live mode** in Stripe Dashboard
2. Get your live API keys
3. Create live products and prices
4. Set up live webhook endpoint
5. Update environment variables with live keys
6. Update `NEXT_PUBLIC_APP_URL` to your production domain

## Important Notes

- The webhook handler uses the client Firebase SDK. For production, consider using Firebase Admin SDK for better security and reliability.
- Ensure your Firestore security rules allow writing to the `businesses` collection for authenticated users.
- The business creation happens after payment confirmation via the success page.
- Receipts are available in the user profile after successful subscription.

## Troubleshooting

1. **Webhook not receiving events**: Check that your webhook endpoint is accessible and the signing secret is correct.
2. **Business not created**: Check browser console and server logs for errors. Verify Firestore permissions.
3. **Payment succeeds but business not created**: Check the success page logs and ensure the API route is accessible.

