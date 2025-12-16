/**
 * Stripe Configuration
 * One-time purchase pricing tiers for Christmas Advent Calendar
 */

export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || '',
  webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || '',
};

export interface PricingTier {
  id: 'basic' | 'premium' | 'deluxe';
  name: string;
  price: number;
  priceId: string; // Stripe Price ID
  calendars: number;
  features: string[];
  popular?: boolean;
  giftVouchers?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 19,
    priceId: import.meta.env.VITE_STRIPE_PRICE_BASIC || 'price_basic',
    calendars: 1,
    features: [
      '1 advent calendar',
      'Beautiful templates',
      'Photo & text uploads',
      'Magical animations',
      'Lifetime access'
    ]
  },
  {
    id: 'premium',
    name: 'Advanced AI',
    price: 39,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM || 'price_premium',
    calendars: 3,
    features: [
      '3 advent calendars',
      'All templates + exclusives',
      'AI-powered messages',
      'Video message uploads',
      'Priority email support',
      'Lifetime access'
    ],
    popular: true
  },
  {
    id: 'deluxe',
    name: 'Custom Family',
    price: 99,
    priceId: import.meta.env.VITE_STRIPE_PRICE_DELUXE || 'price_deluxe',
    calendars: 10,
    features: [
      '10 advent calendars',
      'Custom template design',
      'Premium AI assistance',
      'Video & audio uploads',
      'Dedicated family support',
      'Gift voucher codes',
      'Lifetime access'
    ],
    giftVouchers: true
  }
];

export const SUCCESS_URL = `${window.location.origin}/payment/success`;
export const CANCEL_URL = `${window.location.origin}/payment/cancel`;
