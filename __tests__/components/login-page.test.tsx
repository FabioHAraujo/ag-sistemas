import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'

// Mock do fetch
global.fetch = jest.fn()

// Mock do useRouter
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })
    mockPush.mockClear()
  })

  it('deve renderizar o formulário de login', () => {
    render(<LoginPage />)

    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('deve mostrar erros de validação para campos vazios', async () => {
    const user = userEvent.setup()
    const fetchSpy = jest.fn()
    ;(global.fetch as jest.Mock).mockImplementation(fetchSpy)

    render(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitButton)

    // Aguardar um pouco para garantir que a validação foi executada
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Fetch não deve ter sido chamado porque o formulário é inválido
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('deve mostrar erro para email inválido', async () => {
    const user = userEvent.setup()
    const fetchSpy = jest.fn()
    ;(global.fetch as jest.Mock).mockImplementation(fetchSpy)

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)

    await user.type(emailInput, 'email-invalido')
    await user.type(passwordInput, 'senha123')

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitButton)

    // Aguardar um pouco para garantir que a validação foi executada
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Fetch não deve ter sido chamado porque o email é inválido
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('deve fazer login com sucesso para usuário ADMIN', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        user: {
          id: '1',
          email: 'admin@networking.com',
          name: 'Admin User',
          role: 'ADMIN',
        },
        token: 'mock-jwt-token',
      }),
    })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)

    await user.type(emailInput, 'admin@networking.com')
    await user.type(passwordInput, 'Admin@123')

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@networking.com',
          password: 'Admin@123',
        }),
      })
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/applications')
    })
  })

  it('deve fazer login com sucesso para usuário MEMBER', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        user: {
          id: '2',
          email: 'member@networking.com',
          name: 'Member User',
          role: 'MEMBER',
        },
        token: 'mock-jwt-token',
      }),
    })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)

    await user.type(emailInput, 'member@networking.com')
    await user.type(passwordInput, 'Member@123')

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('deve desabilitar o botão durante o envio', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  user: { role: 'ADMIN' },
                }),
              }),
            200
          )
        )
    )

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)

    await user.type(emailInput, 'admin@networking.com')
    await user.type(passwordInput, 'Admin@123')

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitButton)

    await waitFor(
      () => {
        expect(screen.queryByText('Entrando...')).toBeInTheDocument()
      },
      { timeout: 1000 }
    )
  })

  it('deve mostrar erro quando as credenciais são inválidas', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Credenciais inválidas' }),
    })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)

    await user.type(emailInput, 'wrong@email.com')
    await user.type(passwordInput, 'wrongpassword')

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument()
    })
  })

  it('deve mostrar erro quando o usuário está inativo', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Usuário inativo ou suspenso' }),
    })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)

    await user.type(emailInput, 'inactive@networking.com')
    await user.type(passwordInput, 'Password@123')

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Usuário inativo ou suspenso')).toBeInTheDocument()
    })
  })

  it('deve tratar erros de rede adequadamente', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Erro interno do servidor' }),
    })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)

    await user.type(emailInput, 'user@networking.com')
    await user.type(passwordInput, 'Password@123')

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Erro interno do servidor')).toBeInTheDocument()
    })
  })

  it('deve limpar erro anterior ao tentar novamente', async () => {
    const user = userEvent.setup()

    // Primeira tentativa: erro
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Credenciais inválidas' }),
    })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)

    await user.type(emailInput, 'wrong@email.com')
    await user.type(passwordInput, 'wrong')

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument()
    })

    // Segunda tentativa: sucesso
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { role: 'MEMBER' },
        token: 'valid-token',
      }),
    })

    await user.clear(emailInput)
    await user.clear(passwordInput)
    await user.type(emailInput, 'correct@email.com')
    await user.type(passwordInput, 'correct')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText('Credenciais inválidas')).not.toBeInTheDocument()
    })
  })
})
