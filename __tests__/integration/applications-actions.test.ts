/**
 * @jest-environment node
 */

import type { NextRequest } from 'next/server'
import { POST as approvePost } from '@/app/api/applications/[id]/approve/route'
import { POST as rejectPost } from '@/app/api/applications/[id]/reject/route'
import { prisma } from '@/lib/prisma'

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    application: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

// Mock das funções de autenticação
jest.mock('@/lib/auth/get-current-user', () => ({
  requireAdmin: jest.fn(),
}))

// Mock do randomBytes
jest.mock('node:crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mock-token-123'),
  })),
}))

import { requireAdmin } from '@/lib/auth/get-current-user'

describe('POST /api/applications/[id]/approve', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve aprovar candidatura e gerar token', async () => {
    const mockApplication = {
      id: '1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      company: 'Empresa LTDA',
      status: 'PENDING',
    }

    const mockUpdatedApplication = {
      ...mockApplication,
      status: 'APPROVED',
      token: 'mock-token-123',
      reviewedBy: 'admin-1',
      reviewedAt: new Date(),
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }

    ;(requireAdmin as jest.Mock).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@networking.com',
      role: 'ADMIN',
    })
    ;(prisma.application.findUnique as jest.Mock).mockResolvedValue(mockApplication)
    ;(prisma.application.update as jest.Mock).mockResolvedValue(mockUpdatedApplication)

    const request = new Request('http://localhost:3000/api/applications/1/approve', {
      method: 'POST',
    }) as NextRequest

    const response = await approvePost(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toContain('aprovada')
    expect(data.application.status).toBe('APPROVED')
    expect(data.registrationLink).toContain('mock-token-123')
    expect(prisma.application.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: expect.objectContaining({
        status: 'APPROVED',
        reviewedBy: 'admin-1',
        token: 'mock-token-123',
      }),
    })
  })

  it('deve rejeitar aprovação de candidatura inexistente', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@networking.com',
      role: 'ADMIN',
    })
    ;(prisma.application.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/applications/999/approve', {
      method: 'POST',
    }) as NextRequest

    const response = await approvePost(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toContain('não encontrada')
    expect(prisma.application.update).not.toHaveBeenCalled()
  })

  it('deve rejeitar aprovação de candidatura já processada', async () => {
    const mockApplication = {
      id: '1',
      status: 'APPROVED',
    }

    ;(requireAdmin as jest.Mock).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@networking.com',
      role: 'ADMIN',
    })
    ;(prisma.application.findUnique as jest.Mock).mockResolvedValue(mockApplication)

    const request = new Request('http://localhost:3000/api/applications/1/approve', {
      method: 'POST',
    }) as NextRequest

    const response = await approvePost(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('já foi processada')
    expect(prisma.application.update).not.toHaveBeenCalled()
  })
})

describe('POST /api/applications/[id]/reject', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve rejeitar candidatura', async () => {
    const mockApplication = {
      id: '1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      status: 'PENDING',
    }

    const mockUpdatedApplication = {
      ...mockApplication,
      status: 'REJECTED',
      reviewedBy: 'admin-1',
      reviewedAt: new Date(),
    }

    ;(requireAdmin as jest.Mock).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@networking.com',
      role: 'ADMIN',
    })
    ;(prisma.application.findUnique as jest.Mock).mockResolvedValue(mockApplication)
    ;(prisma.application.update as jest.Mock).mockResolvedValue(mockUpdatedApplication)

    const request = new Request('http://localhost:3000/api/applications/1/reject', {
      method: 'POST',
    }) as NextRequest

    const response = await rejectPost(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toContain('rejeitada')
    expect(data.application.status).toBe('REJECTED')
    expect(prisma.application.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: expect.objectContaining({
        status: 'REJECTED',
        reviewedBy: 'admin-1',
      }),
    })
  })

  it('deve rejeitar rejeição de candidatura inexistente', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@networking.com',
      role: 'ADMIN',
    })
    ;(prisma.application.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/applications/999/reject', {
      method: 'POST',
    }) as NextRequest

    const response = await rejectPost(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toContain('não encontrada')
    expect(prisma.application.update).not.toHaveBeenCalled()
  })

  it('deve rejeitar rejeição de candidatura já processada', async () => {
    const mockApplication = {
      id: '1',
      status: 'REJECTED',
    }

    ;(requireAdmin as jest.Mock).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@networking.com',
      role: 'ADMIN',
    })
    ;(prisma.application.findUnique as jest.Mock).mockResolvedValue(mockApplication)

    const request = new Request('http://localhost:3000/api/applications/1/reject', {
      method: 'POST',
    }) as NextRequest

    const response = await rejectPost(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('já foi processada')
    expect(prisma.application.update).not.toHaveBeenCalled()
  })
})
