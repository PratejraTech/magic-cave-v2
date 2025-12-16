/**
 * Stripe Checkout API Handler
 * This would typically be a serverless function or Express route
 * For development, we're using a mock API approach
 */

import { createCheckoutSession } from '../lib/stripe/server';
import type { CheckoutSessionRequest } from '../lib/stripe/client';

/**
 * POST /api/stripe/create-checkout-session
 * Create a Stripe checkout session
 */
export const handleCreateCheckoutSession = async (req: CheckoutSessionRequest) => {
  try {
    const { priceId, tierId, quantity, customerEmail } = req;

    // Validate request
    if (!priceId || !tierId) {
      throw new Error('Missing required parameters: priceId and tierId');
    }

    // Create checkout session
    const session = await createCheckoutSession({
      priceId,
      tierId,
      quantity,
      customerEmail,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error in create checkout session:', error);
    throw error;
  }
};

/**
 * Mock API router for client-side calls
 * In production, replace this with actual backend API calls
 */
export const stripeCheckoutAPI = {
  createSession: async (request: CheckoutSessionRequest) => {
    try {
      const result = await handleCreateCheckoutSession(request);
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create checkout session');
    }
  },
};
