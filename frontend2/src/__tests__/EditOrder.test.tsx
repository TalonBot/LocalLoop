/// <reference types="jest" />

import { render, screen, fireEvent } from "@testing-library/react";
import EditOrder from "@/components/Orders/EditOrder";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";

jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
}));

describe("EditOrder Component", () => {
  const mockToggleModal = jest.fn();
  const mockOrder = { status: "" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders status options", () => {
    render(<EditOrder order={mockOrder} toggleModal={mockToggleModal} />);
    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(screen.getByText("On Hold")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("shows toast error if no status selected", () => {
    render(<EditOrder order={{ status: "" }} toggleModal={mockToggleModal} />);
    fireEvent.click(screen.getByText(/Save Changes/i));
    expect(toast.error).toHaveBeenCalledWith("Please select a status");
    expect(mockToggleModal).not.toHaveBeenCalled();
  });

  it("calls toggleModal on valid submit", () => {
    render(<EditOrder order={{ status: "processing" }} toggleModal={mockToggleModal} />);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "delivered" },
    });
    fireEvent.click(screen.getByText(/Save Changes/i));
    expect(mockToggleModal).toHaveBeenCalledWith(false);
  });
});
