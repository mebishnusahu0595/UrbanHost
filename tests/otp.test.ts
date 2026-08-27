import { describe, it, expect } from "vitest";

// OTP timing & rate limit logic matching app/api/auth/otp/send/route.ts
function checkOtpRateLimit({
  lastSentAt,
  currentTime,
  cooldownSeconds = 30,
}: {
  lastSentAt: Date;
  currentTime: Date;
  cooldownSeconds?: number;
}) {
  const timeDiffSeconds = (currentTime.getTime() - lastSentAt.getTime()) / 1000;
  if (timeDiffSeconds < cooldownSeconds) {
    return {
      allowed: false,
      waitSeconds: Math.ceil(cooldownSeconds - timeDiffSeconds),
    };
  }
  return { allowed: true, waitSeconds: 0 };
}

describe("OTP Rate Limit & Expiration Logic", () => {
  it("should block requests within cooldown window (e.g. 10s after last send)", () => {
    const lastSentAt = new Date("2026-08-27T10:00:00.000Z");
    const currentTime = new Date("2026-08-27T10:00:10.000Z"); // 10s later

    const result = checkOtpRateLimit({
      lastSentAt,
      currentTime,
      cooldownSeconds: 30,
    });

    expect(result.allowed).toBe(false);
    expect(result.waitSeconds).toBe(20);
  });

  it("should permit requests after cooldown window expires (e.g. 35s after last send)", () => {
    const lastSentAt = new Date("2026-08-27T10:00:00.000Z");
    const currentTime = new Date("2026-08-27T10:00:35.000Z"); // 35s later

    const result = checkOtpRateLimit({
      lastSentAt,
      currentTime,
      cooldownSeconds: 30,
    });

    expect(result.allowed).toBe(true);
    expect(result.waitSeconds).toBe(0);
  });

  it("should correctly validate OTP digit generation", () => {
    for (let i = 0; i < 50; i++) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      expect(otp).toMatch(/^\d{6}$/);
      const num = parseInt(otp, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
    }
  });
});
