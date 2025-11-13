/**
 * @jest-environment node
 */

import type { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/register/route'
import { hashPassword } from '@/lib/auth/password'
import { prisma } from '@/lib/prisma'

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    application: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    memberProfile: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

// Mock da função de hash
jest.mock('@/lib/auth/password', () => ({
  hashPassword: jest.fn(),
}))

// Mock do JWT
jest.mock('@/lib/auth/jwt', () => ({
  signToken: jest.fn(() => 'mock-jwt-token'),
}))

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve registrar um novo usuário com token válido', async () => {
    const mockApplication = {
      id: 'app-1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      company: 'Empresa LTDA',
      status: 'APPROVED',
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }

    const mockUser = {
      id: 'user-1',
      email: 'joao@empresa.com',
      name: 'João Silva',
      role: 'MEMBER',
      status: 'ACTIVE',
    }

    ;(prisma.application.findUnique as jest.Mock).mockResolvedValue(mockApplication)
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(hashPassword as jest.Mock).mockResolvedValue('hashed-password')
    ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
      callback({
        user: {
          create: jest.fn().mockResolvedValue(mockUser),
        },
        memberProfile: {
          create: jest.fn().mockResolvedValue({}),
        },
        application: {
          update: jest.fn().mockResolvedValue({}),
        },
      })
    )

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'valid-token',
        password: 'Senha@123',
        phone: '+5511999999999',
        position: 'CEO',
        bio: 'Profissional com 10 anos de experiência em gestão empresarial.',
      }),
    }) as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user.email).toBe('joao@empresa.com')
    expect(data.token).toBe('mock-jwt-token')

    // Verificar cookie
    const cookies = response.headers.get('set-cookie')
    expect(cookies).toContain('auth-token=mock-jwt-token')
    expect(cookies).toContain('HttpOnly')
  })

  it('deve rejeitar registro sem token', async () => {
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'Senha@123',
        phone: '+5511999999999',
        position: 'CEO',
      }),
    }) as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('inválidos')
  })

  it('deve rejeitar registro com token inválido', async () => {
    ;(prisma.application.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'invalid-token',
        password: 'Senha@123',
        phone: '+5511999999999',
        position: 'CEO',
      }),
    }) as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('inválido')
  })

  it('deve rejeitar registro com token expirado', async () => {
    const mockApplication = {
      id: 'app-1',
      status: 'APPROVED',
      tokenExpiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expirado ontem
    }

    ;(prisma.application.findUnique as jest.Mock).mockResolvedValue(mockApplication)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'expired-token',
        password: 'Senha@123',
        phone: '+5511999999999',
        position: 'CEO',
      }),
    }) as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('expirado')
  })

  it('deve rejeitar registro com candidatura não aprovada', async () => {
    const mockApplication = {
      id: 'app-1',
      status: 'PENDING',
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }

    ;(prisma.application.findUnique as jest.Mock).mockResolvedValue(mockApplication)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'pending-token',
        password: 'Senha@123',
        phone: '+5511999999999',
        position: 'CEO',
      }),
    }) as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('aprovada')
  })

  it('deve rejeitar registro se o email já existe', async () => {
    const mockApplication = {
      id: 'app-1',
      email: 'joao@empresa.com',
      status: 'APPROVED',
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }

    const existingUser = {
      id: 'user-1',
      email: 'joao@empresa.com',
    }

    ;(prisma.application.findUnique as jest.Mock).mockResolvedValue(mockApplication)
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'valid-token',
        password: 'Senha@123',
        phone: '+5511999999999',
        position: 'CEO',
      }),
    }) as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('cadastrado')
  })

  it('deve rejeitar senha fraca', async () => {
    const mockApplication = {
      id: 'app-1',
      status: 'APPROVED',
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }

    ;(prisma.application.findUnique as jest.Mock).mockResolvedValue(mockApplication)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'valid-token',
        password: 'senha123', // Sem maiúscula e caractere especial
        phone: '+5511999999999',
        position: 'CEO',
      }),
    }) as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('inválidos')
  })
})
