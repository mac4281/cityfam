# Environment Variables Setup

Based on your Stripe API keys, add these to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Stripe Price IDs (you need to create these in Stripe Dashboard first)
# Go to https://dashboard.stripe.com/products and create:
# 1. A product for "Single Branch" at $500/month - copy the price ID (starts with price_)
# 2. A product for "All Branches" at $1500/month - copy the price ID (starts with price_)
STRIPE_PRICE_ID_SINGLE=price_XXXXX  # Replace with your actual price ID
STRIPE_PRICE_ID_ALL=price_XXXXX     # Replace with your actual price ID

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Webhook Secret (optional for now, needed for production)
# STRIPE_WEBHOOK_SECRET=whsec_XXXXX
```

## Important: Create Products in Stripe First

Before the checkout will work, you need to:

1. Go to https://dashboard.stripe.com/test/products
2. Click "Add product"
3. Create "Single Branch Subscription":
   - Name: "Single Branch Subscription"
   - Price: $500.00
   - Billing period: Monthly
   - Copy the Price ID (it will look like `price_1ABC123...`)
4. Repeat for "All Branches Subscription" at $1,500/month
5. Add the Price IDs to your `.env.local` file
6. **Restart your Next.js dev server** after adding the variables

## After Adding Variables

1. Stop your dev server (Ctrl+C)
2. Start it again: `npm run dev`
3. Try the checkout again

