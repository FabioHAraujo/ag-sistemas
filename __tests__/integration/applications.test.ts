/**
 * @jest-environment node
 */

import { POST } from '@/app/api/applications/route'
import { prisma } from '@/lib/prisma'

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    application: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}))

describe('POST /api/applications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve criar uma nova candidatura com dados válidos', async () => {
    const mockApplication = {
      id: '1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      company: 'Empresa LTDA',
      motivation: 'Quero participar do grupo para expandir minha rede de contatos.',
      status: 'PENDING',
      createdAt: new Date(),
    }

    ;(prisma.application.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.application.create as jest.Mock).mockResolvedValue(mockApplication)

    const request = new Request('http://localhost:3000/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Empresa LTDA',
        motivation: 'Quero participar do grupo para expandir minha rede de contatos.',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toContain('sucesso')
    expect(data.application.email).toBe('joao@empresa.com')
    expect(prisma.application.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'joao@empresa.com',
        name: 'João Silva',
      }),
    })
  })

  it('deve rejeitar candidatura com email inválido', async () => {
    const request = new Request('http://localhost:3000/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'João Silva',
        email: 'email-invalido',
        company: 'Empresa LTDA',
        motivation: 'Motivação válida com mais de 50 caracteres para passar na validação.',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('inválidos')
  })

  it('deve rejeitar candidatura duplicada pendente com o mesmo email', async () => {
    const existingApplication = {
      id: '1',
      email: 'joao@empresa.com',
      status: 'PENDING',
    }

    ;(prisma.application.findFirst as jest.Mock).mockResolvedValue(existingApplication)

    const request = new Request('http://localhost:3000/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Empresa LTDA',
        motivation: 'Quero participar do grupo para expandir minha rede de contatos.',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Já existe')
    expect(prisma.application.create).not.toHaveBeenCalled()
  })

  it('deve rejeitar candidatura com motivação curta', async () => {
    const request = new Request('http://localhost:3000/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Empresa LTDA',
        motivation: 'Muito curta',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('inválidos')
  })

  it('deve tratar erros do banco de dados adequadamente', async () => {
    ;(prisma.application.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost:3000/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Empresa LTDA',
        motivation: 'Quero participar do grupo para expandir minha rede de contatos.',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBeDefined()
  })
})
