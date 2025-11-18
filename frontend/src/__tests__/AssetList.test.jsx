import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AssetList from '../components/AssetList'
import axios from 'axios'

vi.mock('axios')

describe('AssetList', () => {
  const mockAssets = [
    { id: 1, name: 'iPhone', serial_number: 'ASSET001', region_name: 'North' },
    { id: 2, name: 'iPad', serial_number: 'ASSET002', region_name: 'South' }
  ]

  const mockOnCreateNew = vi.fn()
  const mockOnEdit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders asset list heading', () => {
    axios.get.mockResolvedValue({ data: [] })
    render(<AssetList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />)
    expect(screen.getByText(/assets/i)).toBeInTheDocument()
  })

  it('displays create button', () => {
    axios.get.mockResolvedValue({ data: [] })
    render(<AssetList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />)
    expect(screen.getByText(/create new asset/i)).toBeInTheDocument()
  })

  it('displays assets after loading', async () => {
    axios.get.mockResolvedValue({ data: mockAssets })

    render(<AssetList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />)

    await waitFor(() => {
      expect(screen.getByText('iPhone')).toBeInTheDocument()
      expect(screen.getByText('ASSET001')).toBeInTheDocument()
      expect(screen.getByText('iPad')).toBeInTheDocument()
    })
  })

  it('calls onCreateNew when create button clicked', async () => {
    axios.get.mockResolvedValue({ data: [] })

    render(<AssetList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />)

    const createButton = screen.getByText(/create new asset/i)
    fireEvent.click(createButton)

    expect(mockOnCreateNew).toHaveBeenCalledTimes(1)
  })

  it('calls onEdit when edit button clicked', async () => {
    axios.get.mockResolvedValue({ data: mockAssets })

    render(<AssetList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />)

    await waitFor(() => {
      const editButtons = screen.getAllByText(/edit/i)
      fireEvent.click(editButtons[0])
      expect(mockOnEdit).toHaveBeenCalledWith(mockAssets[0])
    })
  })

  it('displays no assets message when empty', async () => {
    axios.get.mockResolvedValue({ data: [] })

    render(<AssetList onCreateNew={mockOnCreateNew} onEdit={mockOnEdit} />)

    await waitFor(() => {
      expect(screen.getByText(/no assets found/i)).toBeInTheDocument()
    })
  })
})
