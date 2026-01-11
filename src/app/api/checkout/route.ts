import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe only if the secret key is available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is initialized
    if (!stripe) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe is not configured. Please check your environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      businessData,
      subscriptionTier,
      userId,
      userEmail,
    }: {
      businessData: {
        name: string;
        description?: string;
        website?: string;
        imageUrl?: string;
        address?: string;
        phoneNumber?: string;
        email?: string;
      };
      subscriptionTier: 'single' | 'all';
      userId: string;
      userEmail: string;
    } = body;

    if (!businessData.name || !subscriptionTier || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or retrieve price based on subscription tier
    // We'll create prices programmatically - check for existing first, then create if needed
    let priceId: string;
    
    const productName = subscriptionTier === 'single' 
      ? 'Single Branch Subscription' 
      : 'All Branches Subscription';
    const unitAmount = subscriptionTier === 'single' ? 50000 : 150000; // $500 or $1500 in cents
    
    // First, check if we have price IDs in environment variables (preferred)
    if (subscriptionTier === 'single' && process.env.STRIPE_PRICE_ID_SINGLE) {
      priceId = process.env.STRIPE_PRICE_ID_SINGLE;
    } else if (subscriptionTier === 'all' && process.env.STRIPE_PRICE_ID_ALL) {
      priceId = process.env.STRIPE_PRICE_ID_ALL;
    } else {
      // Look for existing product by name
      const products = await stripe.products.list({
        limit: 100,
        active: true,
      });
      
      let product = products.data.find(p => p.name === productName);
      
      // If product doesn't exist, create it
      if (!product) {
        product = await stripe.products.create({
          name: productName,
          description: subscriptionTier === 'single' 
            ? 'Monthly subscription for a single branch location'
            : 'Monthly subscription to broadcast to all branches',
        });
      }
      
      // Look for existing price for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      });
      
      let price = prices.data.find(p => 
        p.unit_amount === unitAmount && 
        p.currency === 'usd' && 
        p.recurring?.interval === 'month'
      );
      
      // If price doesn't exist, create it
      if (!price) {
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: unitAmount,
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
        });
      }
      
      priceId = price.id;
      
      // Log the price ID so you can optionally add it to .env.local for future use
      console.log(`Created/found ${productName} price ID: ${priceId}`);
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: userEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/checkout/cancel`,
      metadata: {
        userId,
        businessName: businessData.name,
        businessDescription: businessData.description || '',
        businessWebsite: businessData.website || '',
        businessImageUrl: businessData.imageUrl || '',
        businessAddress: businessData.address || '',
        businessPhoneNumber: businessData.phoneNumber || '',
        businessEmail: businessData.email || '',
        subscriptionTier,
      },
    });

    // Return the session URL instead of session ID for direct redirect
    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create checkout session',
        details: error.type || error.code || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
