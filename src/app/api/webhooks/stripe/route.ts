import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Note: For production, you should use Firebase Admin SDK
// For now, this webhook handler will need to be called via a separate service
// or you can use Firebase Admin SDK (requires service account credentials)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Get the subscription to get the customer ID
    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
      console.error('No subscription ID in session');
      return NextResponse.json({ received: true });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = subscription.customer as string;

    // Get metadata from the session
    const metadata = session.metadata;
    if (!metadata) {
      console.error('No metadata in session');
      return NextResponse.json({ received: true });
    }

    try {
      // For production, use Firebase Admin SDK here
      // For now, we'll use a client-side approach via an API route
      // The business creation should happen in the success page
      
      // Store the session data temporarily (you might want to use a database for this)
      // Or better: Call a separate API endpoint that uses Admin SDK
      console.log('Payment successful for business:', metadata.businessName);
      console.log('Customer ID:', customerId);
      console.log('Subscription ID:', subscriptionId);
      console.log('Metadata:', metadata);

      // In production, create business here using Firebase Admin SDK
      // For now, we'll handle it in the success page with a server action or API route
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      // Don't return error to Stripe, we'll handle it manually
    }
  }

  // Handle subscription updates
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    console.log('Subscription updated:', subscription.id, 'Status:', subscription.status);
    // Update subscription status in Firestore using Admin SDK in production
  }

  return NextResponse.json({ received: true });
}
