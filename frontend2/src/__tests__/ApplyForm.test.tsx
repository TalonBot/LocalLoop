/// <reference types="jest" />

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ApplyForm from "@/components/Apply";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";

jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
  success: jest.fn(),
  loading: jest.fn(() => "mock-toast-id"),
  dismiss: jest.fn(),
}));


jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock fetch to simulate API success
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

describe("ApplyForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all input fields", () => {
    render(<ApplyForm />);
    expect(screen.getByLabelText(/Business Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reason/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload PDF Documents/i)).toBeInTheDocument();
  });

  it("allows submitting empty form without crashing", () => {
  render(<ApplyForm />);
  const submitButton = screen.getByText(/Submit Application/i);
  fireEvent.click(submitButton);
  });


  it("submits the form with valid data", async () => {
    render(<ApplyForm />);

    fireEvent.change(screen.getByLabelText(/Business Name/i), {
      target: { value: "EcoGrid" },
    });
    fireEvent.change(screen.getByLabelText(/Reason/i), {
      target: { value: "We build things." },
    });

    const file = new File(["dummy"], "test.pdf", { type: "application/pdf" });
    const fileInput = screen.getByLabelText(/Upload PDF Documents/i);

    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByText(/Submit Application/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
