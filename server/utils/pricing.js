import * as kvStore from '../services/kvStore.js';

const SURGE_CACHE_KEY = 'surge:current';
const SURGE_CACHE_TTL = 300; // 5 minutes in seconds

function calculateSurge(now = new Date()) {
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;
  const isMorningPeak = hour >= 8 && hour < 10;
  const isEveningPeak = hour >= 17 && hour < 20;

  if (isMorningPeak || isEveningPeak) {
    return {
      isSurge: true,
      multiplier: 1.3,
      reason: isMorningPeak
        ? 'Morning peak 8-10 AM'
        : 'Evening peak 5-8 PM',
      type: 'peak',
      until: isMorningPeak ? '10:00 AM' : '8:00 PM'
    };
  }

  if (isWeekend) {
    return {
      isSurge: true,
      multiplier: 1.2,
      reason: 'Weekend pricing',
      type: 'weekend',
      until: 'Monday 12:00 AM'
    };
  }

  return {
    isSurge: false,
    multiplier: 1.0,
    reason: 'Standard pricing',
    type: 'standard',
    until: null
  };
}

export async function getSurgePricing() {
  try {
    const cached = await kvStore.get(SURGE_CACHE_KEY);

    if (cached) {
        return { ...cached, fromCache: true };
    }

    const fresh = calculateSurge();
    await kvStore.set(SURGE_CACHE_KEY, fresh, SURGE_CACHE_TTL);
    console.log('Surge cache refreshed:', fresh.type);
    return { ...fresh, fromCache: false };

  } catch (err) {
    console.error('Surge store error, using live calc:', err);
    return { ...calculateSurge(), fromCache: false };
  }
}

export function applyPricing(basePrice, surgeData, amenities = {}) {
  const surge = surgeData.multiplier || 1.0;
  const coveredPremium = amenities.covered ? 10 : 0;
  const cctvPremium = amenities.cctv ? 5 : 0;

  const afterSurge = Math.round(basePrice * surge);
  const subtotal = afterSurge + coveredPremium + cctvPremium;
  const platformFee = Math.round(subtotal * 0.1);
  const total = subtotal + platformFee;

  return {
    basePrice,
    surgeMultiplier: surge,
    surgeReason: surgeData.reason,
    afterSurge,
    coveredPremium,
    cctvPremium,
    subtotal,
    platformFee,
    total
  };
}

export function applyCoupon(total, couponCode, isFirstBooking, isWeekend, isMonthly) {
  const coupons = {
    PARK20: {
      type: 'flat',
      value: 20,
      minBooking: 40,
      condition: () => total >= 40
    },
    SAATHI10: {
      type: 'percent',
      value: 10,
      maxDiscount: 50,
      condition: () => true
    },
    FIRST50: {
      type: 'flat',
      value: 50,
      condition: () => isFirstBooking
    },
    WEEKEND15: {
      type: 'percent',
      value: 15,
      maxDiscount: 100,
      condition: () => isWeekend
    },
    MONTHLY25: {
      type: 'percent',
      value: 25,
      maxDiscount: 500,
      condition: () => isMonthly
    }
  };

  const coupon = coupons[couponCode?.toUpperCase()];

  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code' };
  }

  if (!coupon.condition()) {
    const messages = {
      FIRST50: 'This coupon is for first booking only',
      WEEKEND15: 'Valid on weekends only',
      MONTHLY25: 'Valid on monthly bookings only',
      PARK20: `Minimum booking amount ₹${coupon.minBooking}`
    };
    return {
      valid: false,
      error: messages[couponCode.toUpperCase()] || 'Coupon conditions not met'
    };
  }

  let discount = 0;
  if (coupon.type === 'flat') {
    discount = coupon.value;
  } else if (coupon.type === 'percent') {
    discount = Math.round(total * coupon.value / 100);
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }

  return {
    valid: true,
    couponCode: couponCode.toUpperCase(),
    discount,
    finalTotal: Math.max(0, total - discount),
    message: `${couponCode.toUpperCase()} applied — ₹${discount} off`
  };
}
