import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AssetForm from "../components/AssetForm";
import axios from "axios";

vi.mock("axios");

describe("AssetForm", () => {
  const mockRegions = [
    { id: 1, name: "North" },
    { id: 2, name: "South" },
  ];

  const mockDeviceTypes = [
    { id: 1, name: "Laptop" },
    { id: 2, name: "Phone" },
  ];

  const mockStatuses = [
    { id: 1, name: "Available" },
    { id: 2, name: "Assigned" },
  ];

  const mockUsers = [
    { id: 1, name: "John Doe", region: { id: 1 } },
    { id: 2, name: "Jane Smith", region: { id: 2 } },
  ];

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url.includes("regions"))
        return Promise.resolve({ data: mockRegions });
      if (url.includes("device-types"))
        return Promise.resolve({ data: mockDeviceTypes });
      if (url.includes("asset-statuses"))
        return Promise.resolve({ data: mockStatuses });
      if (url.includes("users")) return Promise.resolve({ data: mockUsers });
      return Promise.resolve({ data: [] });
    });
  });

  it("renders create form title when no asset provided", async () => {
    render(<AssetForm onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText(/create new asset/i)).toBeInTheDocument();
    });
  });

  it("renders edit form title when asset provided", async () => {
    const mockAsset = {
      id: 1,
      name: "iPhone",
      serial_number: "ASSET001",
      region_name: "North",
      device_type: { id: 1 },
      status: { id: 1 },
    };

    render(<AssetForm asset={mockAsset} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText(/edit asset/i)).toBeInTheDocument();
    });
  });

  it("populates form fields with asset data", async () => {
    const mockAsset = {
      id: 1,
      name: "iPhone",
      serial_number: "ASSET001",
      region_name: "North",
      device_type: { id: 1 },
      status: { id: 1 },
    };

    render(<AssetForm asset={mockAsset} onClose={mockOnClose} />);

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue("iPhone");
      const serialInput = screen.getByDisplayValue("ASSET001");
      expect(nameInput).toBeInTheDocument();
      expect(serialInput).toBeInTheDocument();
    });
  });

  it("displays form fields", async () => {
    render(<AssetForm onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/asset name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/serial number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/device type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/region/i)).toBeInTheDocument();
    });
  });

  it("displays save and cancel buttons", async () => {
    render(<AssetForm onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText(/save asset/i)).toBeInTheDocument();
      expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    });
  });

  it("calls onClose when cancel button clicked", async () => {
    render(<AssetForm onClose={mockOnClose} />);

    await waitFor(() => {
      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("submits form with valid data", async () => {
    axios.post.mockResolvedValue({ data: { id: 1 } });

    render(<AssetForm onClose={mockOnClose} />);

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText(/enter asset name/i), {
        target: { value: "New iPhone" },
      });
      fireEvent.change(screen.getByPlaceholderText(/enter serial number/i), {
        target: { value: "ASSET123" },
      });
    });

    await waitFor(() => {
      const regionSelect = screen.getByDisplayValue("North");
      fireEvent.change(regionSelect, { target: { value: "1" } });
    });

    await waitFor(() => {
      const submitButton = screen.getByText(/save asset/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/assets/",
        expect.any(Object)
      );
    });
  });

  it("shows validation errors for required fields", async () => {
    render(<AssetForm onClose={mockOnClose} />);

    await waitFor(() => {
      const submitButton = screen.getByText(/save asset/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/asset name is required/i)).toBeInTheDocument();
      expect(
        screen.getByText(/serial number is required/i)
      ).toBeInTheDocument();
    });
  });

  it("calls PUT endpoint when editing existing asset", async () => {
    const mockAsset = {
      id: 1,
      name: "iPhone",
      serial_number: "ASSET001",
      region_name: "North",
      device_type: { id: 1 },
      status: { id: 1 },
    };

    axios.put.mockResolvedValue({ data: mockAsset });

    render(<AssetForm asset={mockAsset} onClose={mockOnClose} />);

    await waitFor(() => {
      const submitButton = screen.getByText(/save asset/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `/api/assets/${mockAsset.id}/`,
        expect.any(Object)
      );
    });
  });

  it("displays error message on submission failure", async () => {
    axios.post.mockRejectedValue(new Error("Failed to save asset"));

    render(<AssetForm onClose={mockOnClose} />);

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText(/enter asset name/i), {
        target: { value: "New iPhone" },
      });
      fireEvent.change(screen.getByPlaceholderText(/enter serial number/i), {
        target: { value: "ASSET123" },
      });
    });

    await waitFor(() => {
      const submitButton = screen.getByText(/save asset/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to save asset/i)).toBeInTheDocument();
    });
  });
});
