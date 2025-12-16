/**
 * Gift Voucher Generation System
 * For Deluxe tier purchases
 */

export interface GiftVoucher {
  code: string;
  tierId: 'basic' | 'premium' | 'deluxe';
  calendarsCount: number;
  expiresAt: Date;
  createdAt: Date;
  redeemedAt?: Date;
  redeemedBy?: string;
  purchaseId: string;
}

/**
 * Generate a unique voucher code
 * Format: XMAS-XXXX-XXXX-XXXX
 */
export const generateVoucherCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar-looking characters
  const segments = 3;
  const segmentLength = 4;

  const generateSegment = () => {
    let segment = '';
    for (let i = 0; i < segmentLength; i++) {
      segment += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return segment;
  };

  const code = `XMAS-${Array.from({ length: segments }, generateSegment).join('-')}`;
  return code;
};

/**
 * Generate multiple vouchers for a purchase
 */
export const generateVouchers = (
  count: number,
  tierId: 'basic' | 'premium' | 'deluxe',
  purchaseId: string
): GiftVoucher[] => {
  const calendarsPerVoucher = tierId === 'basic' ? 1 : tierId === 'premium' ? 3 : 5;
  const expirationMonths = 12; // Vouchers expire in 1 year

  const vouchers: GiftVoucher[] = [];

  for (let i = 0; i < count; i++) {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + expirationMonths);

    vouchers.push({
      code: generateVoucherCode(),
      tierId,
      calendarsCount: calendarsPerVoucher,
      createdAt: now,
      expiresAt,
      purchaseId,
    });
  }

  return vouchers;
};

/**
 * Validate a voucher code
 */
export const validateVoucherCode = (code: string): boolean => {
  // Format: XMAS-XXXX-XXXX-XXXX
  const voucherRegex = /^XMAS-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
  return voucherRegex.test(code);
};

/**
 * Check if voucher is expired
 */
export const isVoucherExpired = (voucher: GiftVoucher): boolean => {
  return new Date() > voucher.expiresAt;
};

/**
 * Check if voucher is redeemed
 */
export const isVoucherRedeemed = (voucher: GiftVoucher): boolean => {
  return !!voucher.redeemedAt;
};

/**
 * Redeem a voucher
 */
export const redeemVoucher = (voucher: GiftVoucher, userId: string): GiftVoucher => {
  if (isVoucherRedeemed(voucher)) {
    throw new Error('Voucher has already been redeemed');
  }

  if (isVoucherExpired(voucher)) {
    throw new Error('Voucher has expired');
  }

  return {
    ...voucher,
    redeemedAt: new Date(),
    redeemedBy: userId,
  };
};

/**
 * Format voucher for display
 */
export const formatVoucherForDisplay = (voucher: GiftVoucher): string => {
  const parts = voucher.code.split('-');
  return parts.join(' - ');
};

/**
 * Generate email content for gift vouchers
 */
export const generateVoucherEmail = (vouchers: GiftVoucher[], purchaserEmail: string): string => {
  const voucherList = vouchers
    .map((v, i) => `${i + 1}. ${formatVoucherForDisplay(v)}`)
    .join('\n');

  return `
🎄 Thank you for your Deluxe Gift Purchase!

You've received ${vouchers.length} gift voucher${vouchers.length > 1 ? 's' : ''} that you can share with family and friends:

${voucherList}

Each voucher includes:
✨ ${vouchers[0].calendarsCount} advent calendar${vouchers[0].calendarsCount > 1 ? 's' : ''}
✨ All premium features
✨ Lifetime access

How to redeem:
1. Visit https://magicavecalendars.com/redeem
2. Enter the voucher code
3. Create an account or sign in
4. Start creating magical memories!

Vouchers expire on: ${vouchers[0].expiresAt.toLocaleDateString()}

Questions? Contact support@magicavecalendars.com

Happy holidays! 🎅
The Magic Cave Calendars Team
  `.trim();
};
