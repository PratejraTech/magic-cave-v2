/**
 * Stripe Webhook Handler
 * Handles Stripe events like successful payments, failed payments, etc.
 *
 * IMPORTANT: In production, this should be a serverless function or backend API route
 * with proper request verification
 */

import type Stripe from 'stripe';
import { verifyWebhookSignature } from '../../lib/stripe/server';
import { generateVouchers, generateVoucherEmail } from '../../lib/vouchers/generator';

/**
 * Handle Stripe webhook events
 * POST /api/webhooks/stripe
 */
export const handleStripeWebhook = async (
  payload: string | Buffer,
  signature: string
) => {
  try {
    // Verify the webhook signature
    const event = verifyWebhookSignature(payload, signature);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
};

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);

  const tierId = session.metadata?.tierId as 'basic' | 'premium' | 'deluxe';
  const customerEmail = session.customer_email || session.customer_details?.email;

  if (!customerEmail) {
    console.error('No customer email found in session');
    return;
  }

  // TODO: In production, update your database:
  // - Create user account if doesn't exist
  // - Grant access to the purchased tier
  // - Record the transaction

  // For Deluxe tier, generate gift vouchers
  if (tierId === 'deluxe') {
    const voucherCount = 5; // Deluxe includes 5 gift vouchers
    const vouchers = generateVouchers(voucherCount, tierId, session.id);

    // TODO: In production:
    // - Save vouchers to database
    // - Send email with voucher codes
    const emailContent = generateVoucherEmail(vouchers, customerEmail);
    console.log('Gift vouchers generated:', vouchers);
    console.log('Email content:', emailContent);

    // In production, send email:
    // await sendEmail({
    //   to: customerEmail,
    //   subject: 'Your Deluxe Advent Calendar Gift Vouchers',
    //   body: emailContent,
    // });
  }

  // TODO: Send welcome email to customer
  console.log(`Access granted to ${customerEmail} for tier: ${tierId}`);
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  // TODO: In production:
  // - Confirm payment in database
  // - Trigger fulfillment process
  // - Send receipt email
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error('Payment failed:', paymentIntent.id);

  // TODO: In production:
  // - Notify customer of failed payment
  // - Log the failure for analysis
  // - Offer retry options
}

/**
 * Mock Express/Serverless handler
 * Replace this with your actual backend framework
 */
export const stripeWebhookHandler = {
  post: async (req: { body: string | Buffer; headers: { [key: string]: string } }) => {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }

    return await handleStripeWebhook(req.body, signature);
  },
};
