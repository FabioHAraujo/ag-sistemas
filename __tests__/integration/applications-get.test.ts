/**
 * @jest-environment node
 */

import type { NextRequest } from 'next/server'
import { GET } from '@/app/api/applications/route'
import { prisma } from '@/lib/prisma'

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    application: {
      findMany: jest.fn(),
    },
  },
}))

// Mock das funções de autenticação
jest.mock('@/lib/auth/get-current-user', () => ({
  requireAdmin: jest.fn(),
}))

import { requireAdmin } from '@/lib/auth/get-current-user'

describe('GET /api/applications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return all applications for admin', async () => {
    const mockApplications = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Empresa A',
        motivation: 'Quero participar do networking.',
        status: 'PENDING',
        createdAt: new Date(),
        reviewer: null,
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@empresa.com',
        company: 'Empresa B',
        motivation: 'Expandir minha rede de contatos.',
        status: 'APPROVED',
        createdAt: new Date(),
        reviewer: {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@networking.com',
        },
      },
    ]

    ;(requireAdmin as jest.Mock).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@networking.com',
      role: 'ADMIN',
    })
    ;(prisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications)

    const request = new Request('http://localhost:3000/api/applications') as NextRequest

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.applications).toHaveLength(2)
    expect(data.applications[0].name).toBe('João Silva')
    expect(prisma.application.findMany).toHaveBeenCalledWith({
      where: undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  })

  it('should filter applications by status', async () => {
    const mockApplications = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Empresa A',
        status: 'PENDING',
        createdAt: new Date(),
        reviewer: null,
      },
    ]

    ;(requireAdmin as jest.Mock).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@networking.com',
      role: 'ADMIN',
    })
    ;(prisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications)

    const request = new Request(
      'http://localhost:3000/api/applications?status=PENDING'
    ) as NextRequest

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.applications).toHaveLength(1)
    expect(prisma.application.findMany).toHaveBeenCalledWith({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  })

  it('should reject non-admin users', async () => {
    ;(requireAdmin as jest.Mock).mockRejectedValue(new Error('Não autorizado'))

    const request = new Request('http://localhost:3000/api/applications') as NextRequest

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBeDefined()
    expect(prisma.application.findMany).not.toHaveBeenCalled()
  })

  it('should handle database errors', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@networking.com',
      role: 'ADMIN',
    })
    ;(prisma.application.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost:3000/api/applications') as NextRequest

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBeDefined()
  })
})
