import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, userId }: { subscriptionId: string; userId: string } = body;

    if (!subscriptionId || !userId) {
      return NextResponse.json(
        { error: 'Subscription ID and User ID are required' },
        { status: 400 }
      );
    }

    // Import Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-11-20.acacia',
    });

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    // Update the business document in Firestore
    const businessesRef = collection(db, 'businesses');
    const q = query(businessesRef, where('stripeSubscriptionId', '==', subscriptionId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const businessDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'businesses', businessDoc.id), {
        subscriptionStatus: 'canceled',
      });

      // Also update supportingCompanies collection
      const supportingCompaniesRef = collection(db, 'supportingCompanies');
      const supportingCompaniesQuery = query(
        supportingCompaniesRef,
        where('stripeSubscriptionId', '==', subscriptionId)
      );
      const supportingCompaniesSnapshot = await getDocs(supportingCompaniesQuery);

      if (!supportingCompaniesSnapshot.empty) {
        const supportingCompanyDoc = supportingCompaniesSnapshot.docs[0];
        await updateDoc(doc(db, 'supportingCompanies', supportingCompanyDoc.id), {
          subscriptionStatus: 'canceled',
          isActive: false,
        });
      }
    }

    // Update user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      subscriptionStatus: 'canceled',
      isPro: false,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
      },
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

