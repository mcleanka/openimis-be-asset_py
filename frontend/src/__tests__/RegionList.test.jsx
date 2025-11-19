import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegionList from "../components/RegionList";
import axios from "axios";

vi.mock("axios");

describe("RegionList", () => {
  const mockRegions = [
    {
      id: 1,
      name: "North",
      created_at: "2025-01-01",
      stats: { total_users: 5, total_assets: 10 },
    },
    {
      id: 2,
      name: "South",
      created_at: "2025-01-02",
      stats: { total_users: 3, total_assets: 7 },
    },
  ];

  const mockOnCreateNew = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders regions heading", () => {
    axios.get.mockResolvedValue({ data: [] });
    render(<RegionList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);
    expect(screen.getByText(/regions/i)).toBeInTheDocument();
  });

  it("displays create button", () => {
    axios.get.mockResolvedValue({ data: [] });
    render(<RegionList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);
    expect(screen.getByText(/create new region/i)).toBeInTheDocument();
  });

  it("displays regions after loading", async () => {
    axios.get.mockResolvedValue({ data: mockRegions });

    render(<RegionList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(screen.getByText("North")).toBeInTheDocument();
      expect(screen.getByText("South")).toBeInTheDocument();
    });
  });

  it("displays region statistics", async () => {
    axios.get.mockResolvedValue({ data: mockRegions });

    render(<RegionList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    await waitFor(() => {
      const cells = screen.getAllByText("5");
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  it("calls onCreateNew when create button clicked", async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<RegionList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    const createButton = screen.getByText(/create new region/i);
    fireEvent.click(createButton);

    expect(mockOnCreateNew).toHaveBeenCalledTimes(1);
  });

  it("calls onEdit when edit button clicked", async () => {
    axios.get.mockResolvedValue({ data: mockRegions });

    render(<RegionList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    await waitFor(() => {
      const editButtons = screen.getAllByText(/edit/i);
      fireEvent.click(editButtons[0]);
      expect(mockOnEdit).toHaveBeenCalledWith(mockRegions[0]);
    });
  });

  it("displays no regions message when empty", async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<RegionList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(screen.getByText(/no regions found/i)).toBeInTheDocument();
    });
  });

  it("displays error message on API failure", async () => {
    axios.get.mockRejectedValue(new Error("API Error"));

    render(<RegionList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it("handles delete action with confirmation", async () => {
    axios.get.mockResolvedValue({ data: mockRegions });
    axios.delete.mockResolvedValue({});

    window.confirm = vi.fn(() => true);

    render(<RegionList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/delete/i);
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(axios.delete).toHaveBeenCalledWith(
        `/api/regions/${mockRegions[0].id}/`
      );
    });
  });

  it("cancels delete when confirmation is rejected", async () => {
    axios.get.mockResolvedValue({ data: mockRegions });
    axios.delete.mockResolvedValue({});

    window.confirm = vi.fn(() => false);

    render(<RegionList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/delete/i);
      fireEvent.click(deleteButtons[0]);
    });

    expect(axios.delete).not.toHaveBeenCalled();
  });
});
