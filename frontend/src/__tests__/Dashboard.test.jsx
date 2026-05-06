import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '../components/Dashboard'
import axios from 'axios'

vi.mock('axios')

describe('Dashboard', () => {
  it('renders dashboard heading', () => {
    axios.get.mockResolvedValue({ data: [] })
    render(<Dashboard />)
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
  })

  it('displays loading state initially', () => {
    axios.get.mockResolvedValue({ data: [] })
    render(<Dashboard />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays statistics after loading', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('assets')) return Promise.resolve({ data: [{}, {}] })
      if (url.includes('users')) return Promise.resolve({ data: [{}] })
      if (url.includes('regions')) return Promise.resolve({ data: [{}, {}, {}] })
      return Promise.resolve({ data: [] })
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText(/Total Assets: 2/i)).toBeInTheDocument()
      expect(screen.getByText(/Total Users: 1/i)).toBeInTheDocument()
      expect(screen.getByText(/Total Regions: 3/i)).toBeInTheDocument()
    })
  })

  it('displays error message on API failure', async () => {
    axios.get.mockRejectedValue(new Error('API Error'))

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
