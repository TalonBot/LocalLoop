import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Coupon from "@/components/Checkout/Coupon"; // Adjust if needed

describe("Coupon Component", () => {
  it("calls onApply when Apply button is clicked", () => {
    const mockOnApply = jest.fn();
    const mockSetCouponCode = jest.fn();

    render(
      <Coupon
        couponCode="TESTCOUPON"
        setCouponCode={mockSetCouponCode}
        handleApplyCoupon={mockOnApply}
        coupon={null}
        couponError=""
        isApplying={false}
        disabled={false}
      />
    );

    const button = screen.getByRole("button", { name: /Apply/i });
    fireEvent.click(button);

    expect(mockOnApply).toHaveBeenCalledTimes(1);
  });
});
