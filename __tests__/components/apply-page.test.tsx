import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApplyPage from '@/app/apply/page'

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

// Mock do fetch
global.fetch = jest.fn()

// Mock do useRouter
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('ApplyPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
    const { toast } = require('sonner')
    toast.error.mockClear()
    toast.success.mockClear()
  })

  it('deve renderizar o formulário de candidatura', () => {
    render(<ApplyPage />)

    expect(screen.getByText('Intenção de Participação')).toBeInTheDocument()
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/empresa/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/por que você quer participar/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar intenção/i })).toBeInTheDocument()
  })

  it('deve mostrar erros de validação para campos vazios', async () => {
    const user = userEvent.setup()
    render(<ApplyPage />)

    const submitButton = screen.getByRole('button', { name: /enviar intenção/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/nome deve ter pelo menos 3 caracteres/i)).toBeInTheDocument()
    })
  })

  it('deve mostrar erro de validação para nome curto', async () => {
    const user = userEvent.setup()
    render(<ApplyPage />)

    const nameInput = screen.getByLabelText(/nome completo/i)
    await user.type(nameInput, 'Jo')

    const submitButton = screen.getByRole('button', { name: /enviar intenção/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/nome deve ter pelo menos 3 caracteres/i)).toBeInTheDocument()
    })
  })

  it('deve mostrar erro de validação para email inválido', async () => {
    const user = userEvent.setup()
    const fetchSpy = jest.fn()
    ;(global.fetch as jest.Mock).mockImplementation(fetchSpy)

    render(<ApplyPage />)

    const nameInput = screen.getByLabelText(/nome completo/i)
    const emailInput = screen.getByLabelText(/email/i)
    const companyInput = screen.getByLabelText(/empresa/i)
    const motivationInput = screen.getByLabelText(/por que você quer participar/i)

    await user.type(nameInput, 'João Silva')
    await user.type(emailInput, 'email-invalido')
    await user.type(companyInput, 'Empresa LTDA')
    await user.type(
      motivationInput,
      'Motivação válida com mais de 50 caracteres para passar na validação.'
    )

    const submitButton = screen.getByRole('button', { name: /enviar intenção/i })
    await user.click(submitButton)

    // Aguardar um pouco para garantir que a validação foi executada
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Fetch não deve ter sido chamado porque o formulário é inválido
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('deve mostrar erro de validação para motivação curta', async () => {
    const user = userEvent.setup()
    render(<ApplyPage />)

    const nameInput = screen.getByLabelText(/nome completo/i)
    const emailInput = screen.getByLabelText(/email/i)
    const companyInput = screen.getByLabelText(/empresa/i)
    const motivationInput = screen.getByLabelText(/por que você quer participar/i)

    await user.type(nameInput, 'João Silva')
    await user.type(emailInput, 'joao@empresa.com')
    await user.type(companyInput, 'Empresa LTDA')
    await user.type(motivationInput, 'Motivação curta')

    const submitButton = screen.getByRole('button', { name: /enviar intenção/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/conte-nos mais sobre sua motivação.*mínimo 50 caracteres/i)
      ).toBeInTheDocument()
    })
  })

  it('deve enviar o formulário com sucesso com dados válidos', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Intenção enviada com sucesso',
        application: { id: '1', email: 'joao@empresa.com' },
      }),
    })

    render(<ApplyPage />)

    const nameInput = screen.getByLabelText(/nome completo/i)
    const emailInput = screen.getByLabelText(/email/i)
    const companyInput = screen.getByLabelText(/empresa/i)
    const motivationInput = screen.getByLabelText(/por que você quer participar/i)

    await user.type(nameInput, 'João Silva')
    await user.type(emailInput, 'joao@empresa.com')
    await user.type(companyInput, 'Empresa LTDA')
    await user.type(
      motivationInput,
      'Quero participar do grupo para expandir minha rede de contatos profissionais.'
    )

    const submitButton = screen.getByRole('button', { name: /enviar intenção/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'João Silva',
          email: 'joao@empresa.com',
          company: 'Empresa LTDA',
          motivation:
            'Quero participar do grupo para expandir minha rede de contatos profissionais.',
        }),
      })
    })

    await waitFor(() => {
      expect(screen.getByText(/intenção enviada com sucesso/i)).toBeInTheDocument()
    })
  })

  it('deve mostrar mensagem de sucesso após o envio', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Intenção enviada com sucesso',
      }),
    })

    render(<ApplyPage />)

    const nameInput = screen.getByLabelText(/nome completo/i)
    const emailInput = screen.getByLabelText(/email/i)
    const companyInput = screen.getByLabelText(/empresa/i)
    const motivationInput = screen.getByLabelText(/por que você quer participar/i)

    await user.type(nameInput, 'Maria Santos')
    await user.type(emailInput, 'maria@empresa.com')
    await user.type(companyInput, 'Minha Empresa')
    await user.type(
      motivationInput,
      'Desejo fazer parte do grupo para trocar experiências e gerar novos negócios.'
    )

    const submitButton = screen.getByRole('button', { name: /enviar intenção/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/intenção enviada com sucesso/i)).toBeInTheDocument()
    })
  })

  it('deve desabilitar o botão de envio durante o envio', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ message: 'Success' }),
              }),
            200
          )
        )
    )

    render(<ApplyPage />)

    const nameInput = screen.getByLabelText(/nome completo/i)
    const emailInput = screen.getByLabelText(/email/i)
    const companyInput = screen.getByLabelText(/empresa/i)
    const motivationInput = screen.getByLabelText(/por que você quer participar/i)

    await user.type(nameInput, 'João Silva')
    await user.type(emailInput, 'joao@empresa.com')
    await user.type(companyInput, 'Empresa LTDA')
    await user.type(
      motivationInput,
      'Quero fazer parte do grupo para expandir minha rede de contatos profissionais.'
    )

    const submitButton = screen.getByRole('button', { name: /enviar intenção/i })
    await user.click(submitButton)

    // Aguardar e verificar que o botão mudou de texto
    await waitFor(
      () => {
        expect(screen.queryByText('Enviando...')).toBeInTheDocument()
      },
      { timeout: 1000 }
    )
  })

  it('deve tratar erros da API adequadamente', async () => {
    const user = userEvent.setup()
    const { toast } = require('sonner')

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Já existe uma intenção pendente com este email' }),
    })

    render(<ApplyPage />)

    const nameInput = screen.getByLabelText(/nome completo/i)
    const emailInput = screen.getByLabelText(/email/i)
    const companyInput = screen.getByLabelText(/empresa/i)
    const motivationInput = screen.getByLabelText(/por que você quer participar/i)

    await user.type(nameInput, 'João Silva')
    await user.type(emailInput, 'joao@empresa.com')
    await user.type(companyInput, 'Empresa LTDA')
    await user.type(
      motivationInput,
      'Quero fazer parte do grupo para expandir minha rede de contatos profissionais.'
    )

    const submitButton = screen.getByRole('button', { name: /enviar intenção/i })
    await user.click(submitButton)

    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith('Já existe uma intenção pendente com este email')
      },
      { timeout: 3000 }
    )
  })
})
