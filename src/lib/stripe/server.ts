/**
 * Stripe Server-Side Utilities
 * NOTE: In a production app, this would be in a backend API
 * For now, we'll create mock endpoints that can be replaced with real backend calls
 */

import Stripe from 'stripe';
import { STRIPE_CONFIG, SUCCESS_URL, CANCEL_URL } from './config';

// Initialize Stripe with secret key (in production, this should be server-side only)
let stripe: Stripe | null = null;

const getStripeInstance = () => {
  if (!stripe && STRIPE_CONFIG.secretKey) {
    stripe = new Stripe(STRIPE_CONFIG.secretKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return stripe;
};

export interface CreateCheckoutSessionParams {
  priceId: string;
  tierId: 'basic' | 'premium' | 'deluxe';
  quantity?: number;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Create a Stripe Checkout Session
 * In production, this should be called from your backend API
 */
export const createCheckoutSession = async (params: CreateCheckoutSessionParams) => {
  const stripeInstance = getStripeInstance();

  if (!stripeInstance) {
    throw new Error('Stripe is not configured. Please add VITE_STRIPE_SECRET_KEY to your .env file.');
  }

  try {
    const session = await stripeInstance.checkout.sessions.create({
      mode: 'payment', // One-time payment
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: params.quantity || 1,
        },
      ],
      success_url: params.successUrl || SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: params.cancelUrl || CANCEL_URL,
      customer_email: params.customerEmail,
      metadata: {
        tierId: params.tierId,
        calendarsCount: params.tierId === 'basic' ? '1' : params.tierId === 'premium' ? '3' : '5',
      },
      // Enable automatic tax calculation (optional)
      automatic_tax: {
        enabled: false, // Set to true if you have Stripe Tax configured
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw error;
  }
};

/**
 * Retrieve a Checkout Session
 */
export const retrieveCheckoutSession = async (sessionId: string) => {
  const stripeInstance = getStripeInstance();

  if (!stripeInstance) {
    throw new Error('Stripe is not configured');
  }

  try {
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
};

/**
 * Verify webhook signature
 */
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string
): Stripe.Event => {
  const stripeInstance = getStripeInstance();

  if (!stripeInstance) {
    throw new Error('Stripe is not configured');
  }

  try {
    const event = stripeInstance.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};
