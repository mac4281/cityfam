import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the invoice PDF from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId);
    
    if (!invoice.invoice_pdf) {
      return NextResponse.json(
        { error: 'Invoice PDF not available' },
        { status: 404 }
      );
    }

    // Return the PDF URL
    return NextResponse.json({ pdfUrl: invoice.invoice_pdf });
  } catch (error: any) {
    console.error('Error retrieving invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve invoice' },
      { status: 500 }
    );
  }
}

