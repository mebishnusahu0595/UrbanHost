import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Badge } from "../components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";

describe("React UI Components", () => {
  describe("Badge Component", () => {
    it("should render default badge text correctly", () => {
      render(<Badge>Verified Hotel</Badge>);
      const badgeElement = screen.getByText("Verified Hotel");
      expect(badgeElement).toBeInTheDocument();
      expect(badgeElement.getAttribute("data-slot")).toBe("badge");
    });

    it("should apply variant classes correctly", () => {
      render(<Badge variant="destructive">Sold Out</Badge>);
      const badgeElement = screen.getByText("Sold Out");
      expect(badgeElement).toBeInTheDocument();
      expect(badgeElement.className).toContain("bg-destructive");
    });
  });

  describe("Card Component", () => {
    it("should render full card structure with title and description", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Luxury Penthouse</CardTitle>
            <CardDescription>Marine Drive, Mumbai</CardDescription>
          </CardHeader>
          <CardContent>
            <p>$12,000 / night</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByText("Luxury Penthouse")).toBeInTheDocument();
      expect(screen.getByText("Marine Drive, Mumbai")).toBeInTheDocument();
      expect(screen.getByText("$12,000 / night")).toBeInTheDocument();
    });
  });
});
