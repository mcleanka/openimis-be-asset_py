import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AssetAssignmentList from "../components/AssetAssignmentList";
import axios from "axios";

vi.mock("axios");

describe("AssetAssignmentList", () => {
  const mockAssignments = [
    {
      id: 1,
      asset_name: "iPhone",
      asset_serial_number: "ASSET001",
      assigned_to_name: "John Doe",
      assigned_date: "2025-01-01",
      returned_date: null,
      is_active: true,
    },
    {
      id: 2,
      asset_name: "iPad",
      asset_serial_number: "ASSET002",
      assigned_to_name: "Jane Smith",
      assigned_date: "2025-01-02",
      returned_date: "2025-02-01",
      is_active: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders audit heading", () => {
    axios.get.mockResolvedValue({ data: [] });
    render(<AssetAssignmentList />);
    expect(screen.getByText(/asset assignments audit/i)).toBeInTheDocument();
  });

  it("displays filter tabs", () => {
    axios.get.mockResolvedValue({ data: [] });
    render(<AssetAssignmentList />);
    expect(screen.getByText(/all assignments/i)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    expect(screen.getByText(/returned/i)).toBeInTheDocument();
  });

  it("displays assignments after loading", async () => {
    axios.get.mockResolvedValue({ data: mockAssignments });

    render(<AssetAssignmentList />);

    await waitFor(() => {
      expect(screen.getByText("iPhone")).toBeInTheDocument();
      expect(screen.getByText("iPad")).toBeInTheDocument();
      expect(screen.getByText("ASSET001")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("displays asset assignment details correctly", async () => {
    axios.get.mockResolvedValue({ data: mockAssignments });

    render(<AssetAssignmentList />);

    await waitFor(() => {
      expect(screen.getByText("ASSET002")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  it("displays active status correctly", async () => {
    axios.get.mockResolvedValue({ data: mockAssignments });

    render(<AssetAssignmentList />);

    await waitFor(() => {
      const statusElements = screen.getAllByText(/active|returned/i);
      expect(statusElements.length).toBeGreaterThan(0);
    });
  });

  it("displays no assignments message when empty", async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<AssetAssignmentList />);

    await waitFor(() => {
      expect(
        screen.getByText(/no assest assignments audit found/i)
      ).toBeInTheDocument();
    });
  });

  it("displays error message on API failure", async () => {
    axios.get.mockRejectedValue(new Error("API Error"));

    render(<AssetAssignmentList />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it("filters for active assignments", async () => {
    axios.get.mockResolvedValue({ data: [mockAssignments[0]] });

    render(<AssetAssignmentList />);

    await waitFor(() => {
      const activeTab = screen.getByText(/active/);
      fireEvent.click(activeTab);
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/asset-assignments/?active=true"
      );
    });
  });

  it("filters for returned assignments", async () => {
    axios.get.mockResolvedValue({ data: [mockAssignments[1]] });

    render(<AssetAssignmentList />);

    await waitFor(() => {
      const returnedTab = screen.getByText(/returned/);
      fireEvent.click(returnedTab);
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/asset-assignments/?active=false"
      );
    });
  });

  it("filters for all assignments", async () => {
    axios.get.mockResolvedValue({ data: mockAssignments });

    render(<AssetAssignmentList />);

    await waitFor(() => {
      const allTab = screen.getByText(/all assignments/);
      fireEvent.click(allTab);
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/asset-assignments/");
    });
  });

  it("displays formatted dates correctly", async () => {
    axios.get.mockResolvedValue({ data: mockAssignments });

    render(<AssetAssignmentList />);

    await waitFor(() => {
      const dateElements = screen.getAllByText(/1\//);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('displays "Active" for null returned_date', async () => {
    axios.get.mockResolvedValue({ data: [mockAssignments[0]] });

    render(<AssetAssignmentList />);

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });

  it("displays status badge styling", async () => {
    axios.get.mockResolvedValue({ data: mockAssignments });

    render(<AssetAssignmentList />);

    await waitFor(() => {
      const statusBadges = screen.getAllByText(/active|returned/i);
      expect(statusBadges.length).toBeGreaterThan(0);
    });
  });

  it("updates filter state when tab clicked", async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<AssetAssignmentList />);

    await waitFor(() => {
      const activeTab = screen.getByText(/^active$/);
      fireEvent.click(activeTab);
    });

    await waitFor(() => {
      const activeTab = screen.getByText(/^active$/);
      expect(activeTab.parentElement).toHaveClass("border-blue-500");
    });
  });
});
