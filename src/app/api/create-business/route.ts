import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp, getDoc, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      userId,
    }: {
      sessionId: string;
      userId: string;
    } = body;

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Session ID and User ID are required' },
        { status: 400 }
      );
    }

    // Note: This is a simplified approach
    // In production, you should verify the Stripe session and use Admin SDK
    // For now, we'll retrieve the session data from Stripe and create the business

    // Import Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-12-15.clover',
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadata = session.metadata;

    if (!metadata) {
      return NextResponse.json(
        { error: 'No metadata found in session' },
        { status: 400 }
      );
    }

    // Get subscription to get customer ID
    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      );
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = subscription.customer as string;

    // Check if business already exists (prevent duplicates)
    const businessesRef = collection(db, 'businesses');
    const q = query(
      businessesRef,
      where('ownerId', '==', userId),
      where('stripeSubscriptionId', '==', subscriptionId)
    );
    const existingBusinesses = await getDocs(q);

    let businessRef;
    if (!existingBusinesses.empty) {
      // Business already exists, use existing business ID
      businessRef = { id: existingBusinesses.docs[0].id };
      
      // Check if supporting company already exists
      const supportingCompaniesRef = collection(db, 'supportingCompanies');
      const supportingCompaniesQuery = query(
        supportingCompaniesRef,
        where('businessId', '==', businessRef.id)
      );
      const existingSupportingCompanies = await getDocs(supportingCompaniesQuery);
      
      if (!existingSupportingCompanies.empty) {
        // Already exists, just return success
        return NextResponse.json({
          success: true,
          businessId: businessRef.id,
        });
      }
    } else {
      // Create business document
      const businessData = {
        name: metadata.businessName,
        description: metadata.businessDescription || '',
        website: metadata.businessWebsite || '',
        imageUrl: metadata.businessImageUrl || '',
        address: metadata.businessAddress || '',
        phoneNumber: metadata.businessPhoneNumber || '',
        email: metadata.businessEmail || '',
        ownerId: userId,
        subscriptionTier: metadata.subscriptionTier,
        subscriptionStatus: 'active',
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        createdAt: serverTimestamp(),
        verificationApproved: false,
        verificationRequested: false,
        isActive: true,
      };

      businessRef = await addDoc(collection(db, 'businesses'), businessData);
    }

    // Create supporting company document for promotion across the app
    const supportingCompanyData = {
      businessId: businessRef.id,
      ownerId: userId,
      name: metadata.businessName,
      description: metadata.businessDescription || '',
      email: metadata.businessEmail || '',
      phone: metadata.businessPhoneNumber || '',
      url: metadata.businessWebsite || '',
      address: metadata.businessAddress || '',
      imageUrl: metadata.businessImageUrl || '',
      subscriptionTier: metadata.subscriptionTier,
      subscriptionStatus: 'active',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      dateCreated: serverTimestamp(),
      views: 0,
      linkClicks: 0,
      likes: 0,
      isActive: true,
    };

    await addDoc(collection(db, 'supportingCompanies'), supportingCompanyData);

    // Update user document with subscription info
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await setDoc(
        userRef,
        {
          isPro: true,
          subscriptionTier: metadata.subscriptionTier,
          stripeCustomerId: customerId,
          subscriptionStatus: 'active',
        },
        { merge: true }
      );
    }

    return NextResponse.json({
      success: true,
      businessId: businessRef.id,
    });
  } catch (error: any) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create business' },
      { status: 500 }
    );
  }
}
