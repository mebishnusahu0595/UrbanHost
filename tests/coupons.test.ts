import { describe, it, expect } from "vitest";

// Pure function testing coupon calculation logic matching app/api/coupons/verify/route.ts
function calculateCouponDiscount({
  coupon,
  orderValue,
  now = new Date(),
}: {
  coupon: {
    code: string;
    startDate: string | Date;
    endDate: string | Date;
    usageLimit: number;
    usedCount: number;
    minOrderValue: number;
    discountType: "flat" | "percentage";
    discountAmount: number;
    maxDiscount: number;
    isActive: boolean;
  };
  orderValue: number;
  now?: Date;
}) {
  if (!coupon.isActive) {
    return { valid: false, error: "Coupon is not active" };
  }

  const startDate = new Date(coupon.startDate);
  const endDate = new Date(coupon.endDate);

  if (now < startDate || now > endDate) {
    return { valid: false, error: "Coupon is expired or not yet active" };
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: "Coupon usage limit exceeded" };
  }

  if (orderValue < coupon.minOrderValue) {
    return {
      valid: false,
      error: `Minimum order value of $${coupon.minOrderValue} required`,
    };
  }

  let discount = 0;
  if (coupon.discountType === "flat") {
    discount = coupon.discountAmount;
  } else {
    discount = (orderValue * coupon.discountAmount) / 100;
    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }

  discount = Math.min(discount, orderValue);

  return {
    valid: true,
    discount,
    finalPrice: orderValue - discount,
  };
}

describe("Coupon Validation & Calculation Logic", () => {
  const baseCoupon = {
    code: "SUMMER50",
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2026-12-31T23:59:59.000Z",
    usageLimit: 100,
    usedCount: 10,
    minOrderValue: 2000,
    discountType: "percentage" as const,
    discountAmount: 20, // 20%
    maxDiscount: 1000,
    isActive: true,
  };

  it("should calculate percentage discount correctly within limit", () => {
    const result = calculateCouponDiscount({
      coupon: baseCoupon,
      orderValue: 3000,
    });

    expect(result.valid).toBe(true);
    expect(result.discount).toBe(600); // 20% of 3000
    expect(result.finalPrice).toBe(2400);
  });

  it("should cap percentage discount at maxDiscount", () => {
    const result = calculateCouponDiscount({
      coupon: baseCoupon,
      orderValue: 10000,
    });

    expect(result.valid).toBe(true);
    expect(result.discount).toBe(1000); // capped at 1000 instead of 2000
    expect(result.finalPrice).toBe(9000);
  });

  it("should reject orders below minOrderValue", () => {
    const result = calculateCouponDiscount({
      coupon: baseCoupon,
      orderValue: 1500, // min is 2000
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Minimum order value");
  });

  it("should reject expired coupons", () => {
    const result = calculateCouponDiscount({
      coupon: baseCoupon,
      orderValue: 5000,
      now: new Date("2027-01-01T00:00:00.000Z"),
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain("expired");
  });

  it("should calculate flat discount correctly", () => {
    const flatCoupon = {
      ...baseCoupon,
      discountType: "flat" as const,
      discountAmount: 500,
      maxDiscount: 0,
    };

    const result = calculateCouponDiscount({
      coupon: flatCoupon,
      orderValue: 4000,
    });

    expect(result.valid).toBe(true);
    expect(result.discount).toBe(500);
    expect(result.finalPrice).toBe(3500);
  });

  it("should reject coupons where usageLimit is reached", () => {
    const exhaustedCoupon = {
      ...baseCoupon,
      usageLimit: 50,
      usedCount: 50,
    };

    const result = calculateCouponDiscount({
      coupon: exhaustedCoupon,
      orderValue: 4000,
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain("limit exceeded");
  });
});
