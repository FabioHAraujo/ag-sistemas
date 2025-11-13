import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminApplicationsPage from '@/app/admin/applications/page'

// Mock do fetch
global.fetch = jest.fn()

describe('AdminApplicationsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('deve mostrar estado de carregamento', () => {
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<AdminApplicationsPage />)

    expect(screen.getByText(/carregando/i)).toBeInTheDocument()
  })

  it('deve renderizar a tabela de candidaturas com dados', async () => {
    const mockApplications = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Empresa A',
        motivation: 'Quero participar do networking.',
        status: 'PENDING',
        createdAt: '2025-11-13T10:00:00Z',
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@empresa.com',
        company: 'Empresa B',
        motivation: 'Expandir minha rede.',
        status: 'APPROVED',
        createdAt: '2025-11-12T10:00:00Z',
        reviewer: {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@networking.com',
        },
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ applications: mockApplications }),
    })

    render(<AdminApplicationsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
      expect(screen.getByText('joao@empresa.com')).toBeInTheDocument()
      expect(screen.getByText('Empresa A')).toBeInTheDocument()
    })
  })

  it('deve mostrar mensagem de estado vazio quando não há candidaturas', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ applications: [] }),
    })

    render(<AdminApplicationsPage />)

    await waitFor(() => {
      expect(screen.getByText(/nenhuma intenção encontrada/i)).toBeInTheDocument()
    })
  })

  it('deve exibir badges de status corretamente', async () => {
    const mockApplications = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Empresa A',
        status: 'PENDING',
        createdAt: '2025-11-13T10:00:00Z',
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@empresa.com',
        company: 'Empresa B',
        status: 'APPROVED',
        createdAt: '2025-11-12T10:00:00Z',
      },
      {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro@empresa.com',
        company: 'Empresa C',
        status: 'REJECTED',
        createdAt: '2025-11-11T10:00:00Z',
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ applications: mockApplications }),
    })

    render(<AdminApplicationsPage />)

    await waitFor(() => {
      expect(screen.getByText('Pendente')).toBeInTheDocument()
      expect(screen.getByText('Aprovado')).toBeInTheDocument()
      expect(screen.getByText('Rejeitado')).toBeInTheDocument()
    })
  })

  it('deve abrir o diálogo de revisão ao clicar no botão "Revisar"', async () => {
    const mockApplications = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Empresa A',
        motivation: 'Quero participar do grupo para expandir minha rede.',
        status: 'PENDING',
        createdAt: '2025-11-13T10:00:00Z',
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ applications: mockApplications }),
    })

    const user = userEvent.setup()
    render(<AdminApplicationsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    const reviewButton = screen.getByRole('button', { name: /revisar/i })
    await user.click(reviewButton)

    await waitFor(() => {
      expect(screen.getByText(/revisar intenção/i)).toBeInTheDocument()
      expect(
        screen.getByText(/quero participar do grupo para expandir minha rede/i)
      ).toBeInTheDocument()
    })
  })

  it('deve aprovar a candidatura com sucesso', async () => {
    const mockApplications = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Empresa A',
        motivation: 'Quero participar.',
        status: 'PENDING',
        createdAt: '2025-11-13T10:00:00Z',
      },
    ]

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ applications: mockApplications }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Aprovado',
          registrationLink: 'http://localhost:3000/register?token=abc123',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          applications: [{ ...mockApplications[0], status: 'APPROVED' }],
        }),
      })

    const user = userEvent.setup()
    render(<AdminApplicationsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    const reviewButton = screen.getByRole('button', { name: /revisar/i })
    await user.click(reviewButton)

    await waitFor(() => {
      expect(screen.getByText(/revisar intenção/i)).toBeInTheDocument()
    })

    const approveButton = screen.getAllByRole('button', { name: /aprovar/i })[0]
    await user.click(approveButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/applications/1/approve', {
        method: 'POST',
      })
    })

    await waitFor(() => {
      expect(screen.getByText(/intenção aprovada/i)).toBeInTheDocument()
      expect(screen.getByText(/register\?token=abc123/i)).toBeInTheDocument()
    })
  })

  it('deve rejeitar a candidatura com sucesso', async () => {
    const mockApplications = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Empresa A',
        motivation: 'Quero participar.',
        status: 'PENDING',
        createdAt: '2025-11-13T10:00:00Z',
      },
    ]

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ applications: mockApplications }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Rejeitado' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          applications: [{ ...mockApplications[0], status: 'REJECTED' }],
        }),
      })

    const user = userEvent.setup()
    render(<AdminApplicationsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    const reviewButton = screen.getByRole('button', { name: /revisar/i })
    await user.click(reviewButton)

    await waitFor(() => {
      expect(screen.getByText(/revisar intenção/i)).toBeInTheDocument()
    })

    const rejectButton = screen.getByRole('button', { name: /rejeitar/i })
    await user.click(rejectButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/applications/1/reject', {
        method: 'POST',
      })
    })
  })

  it('deve desabilitar botões de ação durante o processamento', async () => {
    const mockApplications = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Empresa A',
        motivation: 'Quero participar.',
        status: 'PENDING',
        createdAt: '2025-11-13T10:00:00Z',
      },
    ]

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ applications: mockApplications }),
      })
      .mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ message: 'Success' }),
                }),
              100
            )
          )
      )

    const user = userEvent.setup()
    render(<AdminApplicationsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    const reviewButton = screen.getByRole('button', { name: /revisar/i })
    await user.click(reviewButton)

    const approveButton = screen.getAllByRole('button', { name: /aprovar/i })[0]
    await user.click(approveButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /processando/i })).toBeDisabled()
    })
  })

  it('deve tratar erros de fetch adequadamente', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<AdminApplicationsPage />)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Erro ao carregar intenções')
    })

    alertSpy.mockRestore()
  })

  it('deve mostrar o botão "Revisar" apenas para candidaturas pendentes', async () => {
    const mockApplications = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Empresa A',
        status: 'PENDING',
        createdAt: '2025-11-13T10:00:00Z',
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@empresa.com',
        company: 'Empresa B',
        status: 'APPROVED',
        createdAt: '2025-11-12T10:00:00Z',
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ applications: mockApplications }),
    })

    render(<AdminApplicationsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    const reviewButtons = screen.queryAllByRole('button', { name: /revisar/i })
    expect(reviewButtons).toHaveLength(1)
  })
})
