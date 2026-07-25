import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_collection: 'if_required',
      managed_payments: { enabled: false },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'VeriField PRO Subscription',
            },
            unit_amount: 999,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/?pro=success`,
      cancel_url: `${req.headers.get('origin')}/?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}