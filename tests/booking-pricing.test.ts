import { describe, it, expect } from "vitest";

// Server-side booking price calculator matching app/api/bookings/route.ts
function calculateBookingPrice({
  roomPrice,
  numberOfRooms,
  checkInDate,
  checkOutDate,
  taxRate = 0.12,
}: {
  roomPrice: number;
  numberOfRooms: number;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  taxRate?: number;
}) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw new Error("Invalid date format");
  }

  if (checkOut <= checkIn) {
    throw new Error("Check-out date must be after check-in date");
  }

  const nights = Math.max(
    1,
    Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  );

  const rooms = Math.max(1, numberOfRooms);
  const baseRoomTotal = roomPrice * nights * rooms;
  const taxes = Math.round(baseRoomTotal * taxRate);
  const totalPrice = baseRoomTotal + taxes;

  return {
    nights,
    rooms,
    baseRoomTotal,
    taxes,
    totalPrice,
  };
}

describe("Booking Server Price & Date Validation Logic", () => {
  it("should calculate single night pricing correctly", () => {
    const result = calculateBookingPrice({
      roomPrice: 3000,
      numberOfRooms: 1,
      checkInDate: "2026-09-01T12:00:00.000Z",
      checkOutDate: "2026-09-02T11:00:00.000Z",
    });

    expect(result.nights).toBe(1);
    expect(result.baseRoomTotal).toBe(3000);
    expect(result.taxes).toBe(360); // 12% of 3000
    expect(result.totalPrice).toBe(3360);
  });

  it("should calculate multi-night and multi-room pricing accurately", () => {
    const result = calculateBookingPrice({
      roomPrice: 2500,
      numberOfRooms: 2,
      checkInDate: "2026-09-01T14:00:00.000Z",
      checkOutDate: "2026-09-04T11:00:00.000Z", // 3 nights
    });

    expect(result.nights).toBe(3);
    expect(result.rooms).toBe(2);
    expect(result.baseRoomTotal).toBe(15000); // 2500 * 3 nights * 2 rooms
    expect(result.taxes).toBe(1800); // 12% of 15000
    expect(result.totalPrice).toBe(16800);
  });

  it("should throw an error if check-out date is on or before check-in date", () => {
    expect(() =>
      calculateBookingPrice({
        roomPrice: 3000,
        numberOfRooms: 1,
        checkInDate: "2026-09-05T12:00:00.000Z",
        checkOutDate: "2026-09-05T10:00:00.000Z",
      })
    ).toThrow("Check-out date must be after check-in date");
  });

  it("should throw an error for invalid date strings", () => {
    expect(() =>
      calculateBookingPrice({
        roomPrice: 3000,
        numberOfRooms: 1,
        checkInDate: "invalid-date",
        checkOutDate: "2026-09-05T10:00:00.000Z",
      })
    ).toThrow("Invalid date format");
  });
});
