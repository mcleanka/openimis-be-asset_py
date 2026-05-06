import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserList from "../components/UserList";
import axios from "axios";

vi.mock("axios");

describe("UserList", () => {
  const mockUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      region_name: "North",
      role_name: "Admin",
      assigned_assets_count: 3,
      created_at: "2025-01-01",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      region_name: "South",
      role_name: "User",
      assigned_assets_count: 1,
      created_at: "2025-01-02",
    },
  ];

  const mockOnCreateNew = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders users heading", () => {
    axios.get.mockResolvedValue({ data: [] });
    render(<UserList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);
    expect(screen.getByText(/users/i)).toBeInTheDocument();
  });

  it("displays create button", () => {
    axios.get.mockResolvedValue({ data: [] });
    render(<UserList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);
    expect(screen.getByText(/create new user/i)).toBeInTheDocument();
  });

  it("displays users after loading", async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    render(<UserList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
  });

  it("displays user information correctly", async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    render(<UserList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(screen.getByText("North")).toBeInTheDocument();
      expect(screen.getByText("South")).toBeInTheDocument();
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("User")).toBeInTheDocument();
    });
  });

  it("calls onCreateNew when create button clicked", async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<UserList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    const createButton = screen.getByText(/create new user/i);
    fireEvent.click(createButton);

    expect(mockOnCreateNew).toHaveBeenCalledTimes(1);
  });

  it("calls onEdit when edit button clicked", async () => {
    axios.get.mockResolvedValue({ data: mockUsers });

    render(<UserList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    await waitFor(() => {
      const editButtons = screen.getAllByText(/edit/i);
      fireEvent.click(editButtons[0]);
      expect(mockOnEdit).toHaveBeenCalledWith(mockUsers[0]);
    });
  });

  it("displays no users message when empty", async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<UserList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });

  it("displays error message on API failure", async () => {
    axios.get.mockRejectedValue(new Error("API Error"));

    render(<UserList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it("handles delete action with confirmation", async () => {
    axios.get.mockResolvedValue({ data: mockUsers });
    axios.delete.mockResolvedValue({});

    window.confirm = vi.fn(() => true);

    render(<UserList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/delete/i);
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(axios.delete).toHaveBeenCalledWith(
        `/api/users/${mockUsers[0].id}/`
      );
    });
  });

  it("cancels delete when confirmation is rejected", async () => {
    axios.get.mockResolvedValue({ data: mockUsers });
    axios.delete.mockResolvedValue({});

    window.confirm = vi.fn(() => false);

    render(<UserList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/delete/i);
      fireEvent.click(deleteButtons[0]);
    });

    expect(axios.delete).not.toHaveBeenCalled();
  });
});
