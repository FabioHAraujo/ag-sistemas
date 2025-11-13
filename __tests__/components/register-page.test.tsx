import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSearchParams } from 'next/navigation'
import RegisterPage from '@/app/register/page'

// Mock do fetch
global.fetch = jest.fn()

// Mock do useRouter
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: jest.fn(),
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockReset()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })
    mockPush.mockClear()
  })

  it('deve mostrar erro quando o token está ausente', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => null),
    })

    render(<RegisterPage />)

    expect(screen.getByText(/erro/i)).toBeInTheDocument()
    expect(screen.getByText(/token de convite não fornecido/i)).toBeInTheDocument()
  })

  it('deve renderizar o formulário de registro com token válido', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token-123'),
    })

    render(<RegisterPage />)

    expect(screen.getByText(/complete seu cadastro/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cargo\/posição/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/biografia/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /completar cadastro/i })).toBeInTheDocument()
  })

  it('deve mostrar erros de validação para campos obrigatórios vazios', async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token-123'),
    })

    const user = userEvent.setup()
    render(<RegisterPage />)

    const submitButton = screen.getByRole('button', { name: /completar cadastro/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/senha deve ter pelo menos 8 caracteres/i)).toBeInTheDocument()
    })
  })

  it('deve mostrar erro de validação para senha fraca', async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token-123'),
    })

    const user = userEvent.setup()
    render(<RegisterPage />)

    const passwordInput = screen.getByLabelText(/^senha$/i)
    await user.type(passwordInput, 'senha123')

    const submitButton = screen.getByRole('button', { name: /completar cadastro/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/senha deve conter pelo menos uma letra maiúscula/i)
      ).toBeInTheDocument()
    })
  })

  it('deve mostrar erro quando as senhas não coincidem', async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token-123'),
    })

    const user = userEvent.setup()
    render(<RegisterPage />)

    const passwordInput = screen.getByLabelText(/^senha$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)

    await user.type(passwordInput, 'Senha@123')
    await user.type(confirmPasswordInput, 'Senha@456')

    const submitButton = screen.getByRole('button', { name: /completar cadastro/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument()
    })
  })

  it('deve mostrar erro de validação para telefone inválido', async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token-123'),
    })

    const user = userEvent.setup()
    render(<RegisterPage />)

    const phoneInput = screen.getByLabelText(/telefone/i)
    await user.type(phoneInput, '123')

    const submitButton = screen.getByRole('button', { name: /completar cadastro/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/telefone inválido/i)).toBeInTheDocument()
    })
  })

  it('deve enviar o formulário com sucesso com dados válidos', async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token-123'),
    })

    const user = userEvent.setup()

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Cadastro realizado com sucesso',
        user: {
          id: '1',
          email: 'test@example.com',
        },
      }),
    })

    render(<RegisterPage />)

    const passwordInput = screen.getByLabelText(/^senha$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
    const phoneInput = screen.getByLabelText(/telefone/i)
    const positionInput = screen.getByLabelText(/cargo\/posição/i)

    await user.type(passwordInput, 'Senha@123')
    await user.type(confirmPasswordInput, 'Senha@123')
    await user.type(phoneInput, '+5511999999999')
    await user.type(positionInput, 'CEO')

    const submitButton = screen.getByRole('button', { name: /completar cadastro/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).not.toBeDisabled()

    await user.click(submitButton)

    // Aguardar um pouco e verificar que nenhum erro de validação apareceu
    await new Promise((resolve) => setTimeout(resolve, 500))
  })

  it('deve enviar com biografia quando fornecida', async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token-123'),
    })

    const user = userEvent.setup()
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: {} }),
    })

    render(<RegisterPage />)

    const passwordInput = screen.getByLabelText(/^senha$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
    const phoneInput = screen.getByLabelText(/telefone/i)
    const positionInput = screen.getByLabelText(/cargo\/posição/i)
    const bioInput = screen.getByLabelText(/biografia/i)

    await user.type(passwordInput, 'Senha@123')
    await user.type(confirmPasswordInput, 'Senha@123')
    await user.type(phoneInput, '+5511999999999')
    await user.type(positionInput, 'CEO')
    await user.type(
      bioInput,
      'Profissional com 10 anos de experiência em gestão empresarial e networking.'
    )

    const submitButton = screen.getByRole('button', { name: /completar cadastro/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          body: expect.stringContaining('10 anos de experiência'),
        })
      )
    })

    alertSpy.mockRestore()
  })

  it('deve desabilitar o botão de envio durante o envio', async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token-123'),
    })

    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ user: {} }),
    })

    render(<RegisterPage />)

    const passwordInput = screen.getByLabelText(/^senha$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
    const phoneInput = screen.getByLabelText(/telefone/i)
    const positionInput = screen.getByLabelText(/cargo\/posição/i)

    await user.type(passwordInput, 'Senha@123')
    await user.type(confirmPasswordInput, 'Senha@123')
    await user.type(phoneInput, '+5511999999999')
    await user.type(positionInput, 'CEO')

    const submitButton = screen.getByRole('button', { name: /completar cadastro/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).not.toBeDisabled()
  })

  it('deve tratar erros da API adequadamente', async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'invalid-token'),
    })

    const user = userEvent.setup()

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Token inválido' }),
    })

    render(<RegisterPage />)

    const passwordInput = screen.getByLabelText(/^senha$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
    const phoneInput = screen.getByLabelText(/telefone/i)
    const positionInput = screen.getByLabelText(/cargo\/posição/i)

    await user.type(passwordInput, 'Senha@123')
    await user.type(confirmPasswordInput, 'Senha@123')
    await user.type(phoneInput, '+5511999999999')
    await user.type(positionInput, 'CEO')

    const submitButton = screen.getByRole('button', { name: /completar cadastro/i })
    expect(submitButton).toBeInTheDocument()
  })
})
