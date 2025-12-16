/**
 * Stripe Client-Side Utilities
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from './config';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);
  }
  return stripePromise;
};

export interface CheckoutSessionRequest {
  priceId: string;
  tierId: 'basic' | 'premium' | 'deluxe';
  quantity?: number;
  customerEmail?: string;
}

/**
 * Create a Stripe Checkout Session
 * NOTE: This uses direct Stripe server calls for demo purposes
 * In production, move this to your backend API
 */
export const createCheckoutSession = async (request: CheckoutSessionRequest) => {
  try {
    // Import the server-side API handler (in production, this would be a backend call)
    const { stripeCheckoutAPI } = await import('../api/stripe-checkout');

    const { sessionId } = await stripeCheckoutAPI.createSession(request);
    return sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Redirect to Stripe Checkout
 */
export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await getStripe();

  if (!stripe) {
    throw new Error('Stripe failed to initialize');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });

  if (error) {
    console.error('Stripe redirect error:', error);
    throw error;
  }
};

/**
 * Complete Checkout Flow
 */
export const initiateCheckout = async (request: CheckoutSessionRequest) => {
  try {
    const sessionId = await createCheckoutSession(request);
    await redirectToCheckout(sessionId);
  } catch (error) {
    console.error('Checkout initiation error:', error);
    throw error;
  }
};
