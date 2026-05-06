import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserForm from "../components/UserForm";
import axios from "axios";

vi.mock("axios");

describe("UserForm", () => {
  const mockRegions = [
    { id: 1, name: "North" },
    { id: 2, name: "South" },
  ];

  const mockRoles = [
    { id: 1, name: "Admin" },
    { id: 2, name: "User" },
  ];

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url.includes("regions"))
        return Promise.resolve({ data: mockRegions });
      if (url.includes("user-roles"))
        return Promise.resolve({ data: mockRoles });
      return Promise.resolve({ data: [] });
    });
  });

  it("renders create form title when no user provided", async () => {
    render(<UserForm onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText(/create new user/i)).toBeInTheDocument();
    });
  });

  it("renders edit form title when user provided", async () => {
    const mockUser = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      region: { id: 1 },
      role: { id: 1 },
    };

    render(<UserForm user={mockUser} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText(/edit user/i)).toBeInTheDocument();
    });
  });

  it("populates form fields with user data", async () => {
    const mockUser = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      region: { id: 1 },
      role: { id: 1 },
    };

    render(<UserForm user={mockUser} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
    });
  });

  it("displays form fields", async () => {
    render(<UserForm onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/region/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    });
  });

  it("displays save and cancel buttons", async () => {
    render(<UserForm onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText(/save user/i)).toBeInTheDocument();
      expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    });
  });

  it("calls onClose when cancel button clicked", async () => {
    render(<UserForm onClose={mockOnClose} />);

    await waitFor(() => {
      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("submits form with valid data for create", async () => {
    axios.post.mockResolvedValue({ data: { id: 1 } });

    render(<UserForm onClose={mockOnClose} />);

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText(/enter user's full name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText(/enter email address/i), {
        target: { value: "john@example.com" },
      });
    });

    await waitFor(() => {
      const regionSelect = screen.getByDisplayValue("North");
      fireEvent.change(regionSelect, { target: { value: "1" } });
    });

    await waitFor(() => {
      const roleSelect = screen.getByDisplayValue("Admin");
      fireEvent.change(roleSelect, { target: { value: "1" } });
    });

    await waitFor(() => {
      const submitButton = screen.getByText(/save user/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/users/",
        expect.any(Object)
      );
    });
  });

  it("calls PUT endpoint when editing existing user", async () => {
    const mockUser = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      region: { id: 1 },
      role: { id: 1 },
    };

    axios.put.mockResolvedValue({ data: mockUser });

    render(<UserForm user={mockUser} onClose={mockOnClose} />);

    await waitFor(() => {
      const submitButton = screen.getByText(/save user/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `/api/users/${mockUser.id}/`,
        expect.any(Object)
      );
    });
  });

  it("shows validation error for empty name", async () => {
    render(<UserForm onClose={mockOnClose} />);

    await waitFor(() => {
      const submitButton = screen.getByText(/save user/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/user name is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for empty email", async () => {
    render(<UserForm onClose={mockOnClose} />);

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText(/enter user's full name/i), {
        target: { value: "John Doe" },
      });
    });

    await waitFor(() => {
      const submitButton = screen.getByText(/save user/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email", async () => {
    render(<UserForm onClose={mockOnClose} />);

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText(/enter user's full name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText(/enter email address/i), {
        target: { value: "invalid-email" },
      });
    });

    await waitFor(() => {
      const submitButton = screen.getByText(/save user/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for empty region", async () => {
    render(<UserForm onClose={mockOnClose} />);

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText(/enter user's full name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText(/enter email address/i), {
        target: { value: "john@example.com" },
      });
    });

    await waitFor(() => {
      const submitButton = screen.getByText(/save user/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/region is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for empty role", async () => {
    render(<UserForm onClose={mockOnClose} />);

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText(/enter user's full name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText(/enter email address/i), {
        target: { value: "john@example.com" },
      });
    });

    await waitFor(() => {
      const regionSelect = screen.getByDisplayValue("North");
      fireEvent.change(regionSelect, { target: { value: "1" } });
    });

    await waitFor(() => {
      const submitButton = screen.getByText(/save user/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/role is required/i)).toBeInTheDocument();
    });
  });

  it("displays error message on submission failure", async () => {
    axios.post.mockRejectedValue(new Error("Failed to save user"));

    render(<UserForm onClose={mockOnClose} />);

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText(/enter user's full name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText(/enter email address/i), {
        target: { value: "john@example.com" },
      });
    });

    await waitFor(() => {
      const regionSelect = screen.getByDisplayValue("North");
      fireEvent.change(regionSelect, { target: { value: "1" } });
    });

    await waitFor(() => {
      const roleSelect = screen.getByDisplayValue("Admin");
      fireEvent.change(roleSelect, { target: { value: "1" } });
    });

    await waitFor(() => {
      const submitButton = screen.getByText(/save user/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to save user/i)).toBeInTheDocument();
    });
  });
});
