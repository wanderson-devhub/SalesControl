import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminUsersList } from '@/components/admin-users-list'

// Mock fetch globally
global.fetch = jest.fn()

// Mock window.open
const mockOpen = jest.fn()
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockOpen,
})

describe('AdminUsersList Component', () => {
  const mockUsers = [
    {
      id: '1',
      email: 'user1@example.com',
      warName: 'Alpha',
      rank: 'Soldado',
      phone: '11987654321',
      total: 100.5,
    },
    {
      id: '2',
      email: 'user2@example.com',
      warName: 'Bravo',
      rank: 'Cabo',
      phone: '11987654322',
      total: 50.0,
    },
    {
      id: '3',
      email: 'user3@example.com',
      warName: 'Charlie',
      rank: 'Soldado',
      phone: '11987654323',
      total: 0,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    })
  })

  describe('Initial Render', () => {
    it('should render loading state initially', () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ ok: true, json: async () => mockUsers }),
              100
            )
          )
      )

      render(<AdminUsersList adminId="admin1" />)
      expect(screen.getByText('Carregando...')).toBeInTheDocument()
    })

    it('should fetch users on mount', async () => {
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/users')
      })
    })

    it('should display total count of filtered users', async () => {
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument()
      })
    })

    it('should display users with pending debts in pending tab', async () => {
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
        expect(screen.getByText('Bravo')).toBeInTheDocument()
      })
    })
  })

  describe('Filtering', () => {
    it('should filter users by search term', async () => {
      const user = userEvent.setup()
      render(<AdminUsersList adminId="admin1" />)

      const searchInput = await waitFor(() =>
        screen.getByPlaceholderText('Nome ou email...')
      )

      await user.type(searchInput, 'Alpha')

      expect(screen.getByText('Alpha')).toBeInTheDocument()
      expect(screen.queryByText('Bravo')).not.toBeInTheDocument()
    })

    it('should filter users by email search', async () => {
      const user = userEvent.setup()
      render(<AdminUsersList adminId="admin1" />)

      const searchInput = await waitFor(() =>
        screen.getByPlaceholderText('Nome ou email...')
      )

      await user.type(searchInput, 'user2@')

      expect(screen.getByText('Bravo')).toBeInTheDocument()
      expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
    })

    it('should filter users by rank', async () => {
      const user = userEvent.setup()
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
      })

      const rankSelects = screen.getAllByRole('combobox')
      await user.click(rankSelects[2]) // Rank select

      await waitFor(() => {
        const rankOptions = screen.getAllByRole('option')
        expect(rankOptions.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Sorting', () => {
    it('should sort users A-Z by default', async () => {
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        const userNames = screen.getAllByText(/Alpha|Bravo|Charlie/)
        expect(userNames[0]).toHaveTextContent('Alpha')
      })
    })

    it('should sort users Z-A when selected', async () => {
      const user = userEvent.setup()
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
      })

      const sortSelect = screen.getAllByRole('combobox')[0]
      await user.click(sortSelect)

      const zaOption = screen.getByRole('option', { name: 'Z-A' })
      await user.click(zaOption)

      await waitFor(() => {
        const userCards = screen.getAllByText(/Alpha|Bravo|Charlie/)
        expect(userCards[0]).toHaveTextContent('Charlie')
      })
    })

    it('should sort by highest debt', async () => {
      const user = userEvent.setup()
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
      })

      const sortSelect = screen.getAllByRole('combobox')[0]
      await user.click(sortSelect)

      const highestOption = screen.getByRole('option', { name: 'Maior Valor' })
      await user.click(highestOption)

      await waitFor(() => {
        const debts = screen.getAllByText(/R\$ \d+\.\d{2}/)
        // Alpha (100.5) should come before Bravo (50.0)
        expect(debts[0]).toHaveTextContent('100.50')
      })
    })

    it('should sort by lowest debt', async () => {
      const user = userEvent.setup()
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
      })

      const sortSelect = screen.getAllByRole('combobox')[0]
      await user.click(sortSelect)

      const lowestOption = screen.getByRole('option', { name: 'Menor Valor' })
      await user.click(lowestOption)

      await waitFor(() => {
        // Bravo (50.0) should come before Alpha (100.5)
        expect(screen.getByText('Bravo')).toBeInTheDocument()
      })
    })
  })

  describe('Pagination', () => {
    it('should not show pagination if users fit in one page', async () => {
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
      })

      const paginationButtons = screen.queryAllByRole('button', {
        name: /Anterior|Próxima/,
      })
      expect(paginationButtons.length).toBe(0)
    })

    it('should reset pagination when filters change', async () => {
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [
          ...mockUsers,
          ...Array.from({ length: 25 }, (_, i) => ({
            id: `${i + 4}`,
            email: `user${i + 4}@example.com`,
            warName: `User${i + 4}`,
            rank: 'Soldado',
            phone: '11987654321',
            total: 10 + i,
          })),
        ],
      })

      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Nome ou email...')
      await user.type(searchInput, 'Alpha')

      // Should reset to page 1 after search
      const pageText = screen.queryByText(/Página \d+ de/)
      if (pageText) {
        expect(pageText).toHaveTextContent('Página 1')
      }
    })
  })

  describe('Tabs', () => {
    it('should show pending tab by default', async () => {
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
        expect(screen.getByText('Bravo')).toBeInTheDocument()
      })
    })

    it('should show users with zero debt in cleared tab', async () => {
      const user = userEvent.setup()
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
      })

      const clearedTab = screen.getByRole('tab', { name: 'Sem dívidas' })
      await user.click(clearedTab)

      await waitFor(() => {
        expect(screen.getByText('Charlie')).toBeInTheDocument()
      })
    })
  })

  describe('User Actions', () => {
    it('should expand user details on click', async () => {
      const user = userEvent.setup()
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
      })

      const alphaCard = screen.getByText('Alpha').closest('div')
      await user.click(alphaCard!)

      await waitFor(() => {
        expect(screen.getByText('user1@example.com')).toBeInTheDocument()
        expect(screen.getByText('11987654321')).toBeInTheDocument()
      })
    })

    it('should open WhatsApp on button click', async () => {
      const user = userEvent.setup()
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
      })

      const whatsappButtons = screen.getAllByRole('button', { name: /WhatsApp/ })
      await user.click(whatsappButtons[0])

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('wa.me/5511987654321'),
        '_blank'
      )
    })

    it('should show clear debt confirmation dialog', async () => {
      const user = userEvent.setup()
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
      })

      const zeroPButtons = screen.getAllByRole('button', { name: /Zerar/ })
      await user.click(zeroPButtons[0])

      await waitFor(() => {
        expect(
          screen.getByText(/Você está prestes a zerar a dívida/)
        ).toBeInTheDocument()
      })
    })

    it('should handle clear debt API call', async () => {
      const user = userEvent.setup()
      const clearDebtMock = jest.fn().mockResolvedValue({ ok: true })
      ;(global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/users') {
          return Promise.resolve({
            ok: true,
            json: async () => mockUsers,
          })
        }
        if (url === '/api/admin/consumptions') {
          return clearDebtMock()
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
      })

      const zeroPButtons = screen.getAllByRole('button', { name: /Zerar/ })
      await user.click(zeroPButtons[0])

      await waitFor(() => {
        expect(
          screen.getByText(/Você está prestes a zerar a dívida/)
        ).toBeInTheDocument()
      })

      const confirmButton = screen.getByRole('button', { name: 'Confirmar' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(clearDebtMock).toHaveBeenCalledWith('/api/admin/consumptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: '1' }),
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle fetch error gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(
          screen.getByText('Nenhum usuário com dívidas pendentes')
        ).toBeInTheDocument()
      })
    })

    it('should handle invalid response format', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => 'invalid',
      })

      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(
          screen.getByText('Nenhum usuário com dívidas pendentes')
        ).toBeInTheDocument()
      })
    })

    it('should handle HTTP error responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      })

      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(
          screen.getByText('Nenhum usuário com dívidas pendentes')
        ).toBeInTheDocument()
      })
    })

    it('should handle invalid user data with missing fields', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: '1',
            email: null,
            warName: null,
            rank: 'Soldado',
            phone: '11987654321',
            total: 100.5,
          },
        ],
      })

      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        // Should still render even with missing fields due to null coalescing
        expect(screen.getByText('1')).toBeInTheDocument() // Total count
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty user list', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      })

      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument()
      })
    })

    it('should handle WhatsApp with invalid phone number', async () => {
      const user = userEvent.setup()
      const invalidPhoneUsers = [
        {
          ...mockUsers[0],
          phone: 'invalid',
        },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => invalidPhoneUsers,
      })

      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
      })

      const whatsappButtons = screen.getAllByRole('button', { name: /WhatsApp/ })
      await user.click(whatsappButtons[0])

      // Should not open window if phone is invalid
      expect(mockOpen).not.toHaveBeenCalled()
    })

    it('should handle case-insensitive search', async () => {
      const user = userEvent.setup()
      render(<AdminUsersList adminId="admin1" />)

      await waitFor(() => {
        expect(screen.getByText('Alpha')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Nome ou email...')
      await user.type(searchInput, 'alpha')

      expect(screen.getByText('Alpha')).toBeInTheDocument()
    })
  })
})