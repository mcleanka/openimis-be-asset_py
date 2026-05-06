import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegionForm from "../components/RegionForm";
import axios from "axios";

vi.mock("axios");

describe("RegionForm", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders create form title when no region provided", () => {
    render(<RegionForm onClose={mockOnClose} />);
    expect(screen.getByText(/create new region/i)).toBeInTheDocument();
  });

  it("renders edit form title when region provided", () => {
    const mockRegion = { id: 1, name: "North" };
    render(<RegionForm region={mockRegion} onClose={mockOnClose} />);
    expect(screen.getByText(/edit region/i)).toBeInTheDocument();
  });

  it("populates form field with region data", () => {
    const mockRegion = { id: 1, name: "North" };
    render(<RegionForm region={mockRegion} onClose={mockOnClose} />);

    const nameInput = screen.getByDisplayValue("North");
    expect(nameInput).toBeInTheDocument();
  });

  it("displays region name field", () => {
    render(<RegionForm onClose={mockOnClose} />);
    expect(screen.getByLabelText(/region name/i)).toBeInTheDocument();
  });

  it("displays save and cancel buttons", () => {
    render(<RegionForm onClose={mockOnClose} />);
    expect(screen.getByText(/save region/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it("calls onClose when cancel button clicked", () => {
    render(<RegionForm onClose={mockOnClose} />);

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("submits form with valid data for create", async () => {
    axios.post.mockResolvedValue({ data: { id: 1, name: "New Region" } });

    render(<RegionForm onClose={mockOnClose} />);

    const nameInput = screen.getByPlaceholderText(/enter region name/i);
    fireEvent.change(nameInput, { target: { value: "New Region" } });

    const submitButton = screen.getByText(/save region/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/regions/", {
        name: "New Region",
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("submits form with valid data for edit", async () => {
    const mockRegion = { id: 1, name: "North" };
    axios.put.mockResolvedValue({ data: mockRegion });

    render(<RegionForm region={mockRegion} onClose={mockOnClose} />);

    const nameInput = screen.getByDisplayValue("North");
    fireEvent.change(nameInput, { target: { value: "North Updated" } });

    const submitButton = screen.getByText(/save region/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(`/api/regions/${mockRegion.id}/`, {
        name: "North Updated",
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("shows validation error for empty region name", async () => {
    render(<RegionForm onClose={mockOnClose} />);

    const submitButton = screen.getByText(/save region/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/region name is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for region name too short", async () => {
    render(<RegionForm onClose={mockOnClose} />);

    const nameInput = screen.getByPlaceholderText(/enter region name/i);
    fireEvent.change(nameInput, { target: { value: "A" } });

    const submitButton = screen.getByText(/save region/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/must be at least 2 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("trims whitespace from region name", async () => {
    axios.post.mockResolvedValue({ data: { id: 1, name: "North" } });

    render(<RegionForm onClose={mockOnClose} />);

    const nameInput = screen.getByPlaceholderText(/enter region name/i);
    fireEvent.change(nameInput, { target: { value: "  North Region  " } });

    const submitButton = screen.getByText(/save region/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/regions/", {
        name: "North Region",
      });
    });
  });

  it("displays error message on submission failure", async () => {
    axios.post.mockRejectedValue(new Error("Failed to save region"));

    render(<RegionForm onClose={mockOnClose} />);

    const nameInput = screen.getByPlaceholderText(/enter region name/i);
    fireEvent.change(nameInput, { target: { value: "New Region" } });

    const submitButton = screen.getByText(/save region/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save region/i)).toBeInTheDocument();
    });
  });

  it("displays duplicate region error message", async () => {
    axios.post.mockRejectedValue({
      response: {
        data: {
          name: ["already exists"],
        },
      },
    });

    render(<RegionForm onClose={mockOnClose} />);

    const nameInput = screen.getByPlaceholderText(/enter region name/i);
    fireEvent.change(nameInput, { target: { value: "North" } });

    const submitButton = screen.getByText(/save region/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });

  it("disables submit button while loading", async () => {
    axios.post.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 1000))
    );

    render(<RegionForm onClose={mockOnClose} />);

    const nameInput = screen.getByPlaceholderText(/enter region name/i);
    fireEvent.change(nameInput, { target: { value: "New Region" } });

    const submitButton = screen.getByText(/save region/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });
  });
});
