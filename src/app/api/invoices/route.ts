import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's supporting companies to find Stripe customer ID
    const supportingCompaniesRef = collection(db, 'supportingCompanies');
    const q = query(supportingCompaniesRef, where('ownerId', '==', userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({ invoices: [] });
    }

    // Get the first supporting company's customer ID (users typically have one subscription)
    const company = snapshot.docs[0].data();
    const customerId = company.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json({ invoices: [] });
    }

    // Get invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100,
    });

    // Format invoices for the client
    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount_paid / 100, // Convert from cents to dollars
      currency: invoice.currency.toUpperCase(),
      status: invoice.status,
      created: invoice.created * 1000, // Convert to milliseconds
      invoicePdf: invoice.invoice_pdf,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      description: invoice.description || invoice.lines.data[0]?.description || 'Business Subscription',
    }));

    return NextResponse.json({ invoices: formattedInvoices });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

