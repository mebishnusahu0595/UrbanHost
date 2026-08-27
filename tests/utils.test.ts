import { describe, it, expect } from "vitest";
import { cn, generatePassword, generateStayNTourEmail, generateHotelPassword } from "../lib/utils";

describe("Utility Functions (lib/utils)", () => {
  describe("cn (classnames merge)", () => {
    it("should merge simple classes correctly", () => {
      const result = cn("text-red-500", "font-bold");
      expect(result).toContain("text-red-500");
      expect(result).toContain("font-bold");
    });

    it("should resolve Tailwind conflicts appropriately", () => {
      const result = cn("px-2 py-1", "px-4");
      expect(result).toBe("py-1 px-4");
    });

    it("should ignore falsy values", () => {
      const isHidden = false;
      const result = cn("base-class", isHidden && "hidden", null, undefined);
      expect(result).toBe("base-class");
    });
  });

  describe("generatePassword", () => {
    it("should generate a string of requested length", () => {
      const pwd = generatePassword(16);
      expect(typeof pwd).toBe("string");
      expect(pwd.length).toBe(16);
    });

    it("should default to length 12", () => {
      const pwd = generatePassword();
      expect(pwd.length).toBe(12);
    });
  });

  describe("generateStayNTourEmail", () => {
    it("should format single-word names correctly", () => {
      const email = generateStayNTourEmail("Aarav");
      expect(email).toBe("aarav@stayntour.com");
    });

    it("should format first and last name properly", () => {
      const email = generateStayNTourEmail("Rohit Sharma");
      expect(email).toBe("rohit.sharma@stayntour.com");
    });

    it("should handle names with special characters or extra spaces", () => {
      const email = generateStayNTourEmail("  Ananya   K. Roy  ");
      expect(email).toBe("ananya.roy@stayntour.com");
    });
  });

  describe("generateHotelPassword", () => {
    it("should generate formatted hotel password", () => {
      const pwd = generateHotelPassword("The Grand Heritage Hotel");
      expect(pwd).toBe("thegrandheritagehotel@123");
    });

    it("should strip special characters and whitespace", () => {
      const pwd = generateHotelPassword("Sea-Breeze Resort & Spa!");
      expect(pwd).toBe("seabreezeresortspa@123");
    });
  });
});
