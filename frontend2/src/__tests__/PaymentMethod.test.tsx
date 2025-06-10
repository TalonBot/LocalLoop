/// <reference types="jest" />

import { render, screen, fireEvent } from "@testing-library/react";
import PaymentMethod from "@/components/Checkout/PaymentMethod";
import "@testing-library/jest-dom";

describe("PaymentMethod Component", () => {
  it("renders both payment options", () => {
    const setPayment = jest.fn();
    render(<PaymentMethod payment="cash" setPayment={setPayment} />);

    expect(screen.getByLabelText(/Cash on delivery/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pay with Stripe/i)).toBeInTheDocument();
  });

  it("checks the correct radio button based on the prop", () => {
    const setPayment = jest.fn();
    render(<PaymentMethod payment="stripe" setPayment={setPayment} />);

    expect(screen.getByDisplayValue("stripe")).toBeChecked();
    expect(screen.getByDisplayValue("cash")).not.toBeChecked();
  });

  it("calls setPayment when user selects an option", () => {
    const setPayment = jest.fn();
    render(<PaymentMethod payment="cash" setPayment={setPayment} />);

    const stripeRadio = screen.getByDisplayValue("stripe");
    fireEvent.click(stripeRadio);

    expect(setPayment).toHaveBeenCalledWith("stripe");
  });
});
