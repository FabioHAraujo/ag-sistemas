import { NextRequest } from 'next/server'
import { DELETE, GET as GET_BY_ID, PATCH } from '@/app/api/announcements/[id]/route'
import { GET, POST } from '@/app/api/announcements/route'
import * as auth from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    announcement: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth/get-current-user')

describe('Announcements API', () => {
  const mockAdminUser = {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'ADMIN' as const,
  }

  const mockMemberUser = {
    id: 'member-1',
    email: 'member@test.com',
    name: 'Member User',
    role: 'MEMBER' as const,
  }

  const mockAnnouncement = {
    id: 'announcement-1',
    title: 'Reunião Importante',
    content: 'Reunião agendada para sexta-feira',
    authorId: 'admin-1',
    priority: 'HIGH' as const,
    targetAudience: 'ALL' as const,
    published: true,
    publishedAt: new Date('2025-11-14'),
    expiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@test.com',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/announcements', () => {
    it('deve retornar avisos para membro autenticado', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.announcement.findMany as jest.Mock).mockResolvedValue([mockAnnouncement])

      const request = new NextRequest('http://localhost:3000/api/announcements')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].title).toBe('Reunião Importante')
      expect(prisma.announcement.findMany).toHaveBeenCalledWith({
        where: {
          published: true,
          OR: [{ targetAudience: 'ALL' }, { targetAudience: 'MEMBERS' }],
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
      })
    })

    it('deve retornar 401 se não autenticado', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/announcements')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/announcements', () => {
    it('deve criar aviso se admin', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(prisma.announcement.create as jest.Mock).mockResolvedValue(mockAnnouncement)

      const request = new NextRequest('http://localhost:3000/api/announcements', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Reunião Importante',
          content: 'Reunião agendada para sexta-feira',
          priority: 'HIGH',
          targetAudience: 'ALL',
          published: true,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.title).toBe('Reunião Importante')
      expect(prisma.announcement.create).toHaveBeenCalled()
    })

    it('deve retornar 403 se não for admin', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)

      const request = new NextRequest('http://localhost:3000/api/announcements', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test',
          content: 'Test content',
          priority: 'NORMAL',
          targetAudience: 'ALL',
          published: false,
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/announcements/:id', () => {
    it('deve retornar aviso específico', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.announcement.findUnique as jest.Mock).mockResolvedValue(mockAnnouncement)

      const request = new NextRequest('http://localhost:3000/api/announcements/announcement-1')
      const response = await GET_BY_ID(request, { params: { id: 'announcement-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('announcement-1')
    })

    it('deve retornar 404 se aviso não encontrado', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.announcement.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/announcements/invalid-id')
      const response = await GET_BY_ID(request, { params: { id: 'invalid-id' } })

      expect(response.status).toBe(404)
    })
  })

  describe('PATCH /api/announcements/:id', () => {
    it('deve atualizar aviso se admin', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(prisma.announcement.update as jest.Mock).mockResolvedValue({
        ...mockAnnouncement,
        title: 'Título Atualizado',
      })

      const request = new NextRequest('http://localhost:3000/api/announcements/announcement-1', {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'Título Atualizado',
        }),
      })

      const response = await PATCH(request, { params: { id: 'announcement-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.title).toBe('Título Atualizado')
    })

    it('deve retornar 403 se não for admin', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)

      const request = new NextRequest('http://localhost:3000/api/announcements/announcement-1', {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'Título Atualizado',
        }),
      })

      const response = await PATCH(request, { params: { id: 'announcement-1' } })

      expect(response.status).toBe(403)
    })
  })

  describe('DELETE /api/announcements/:id', () => {
    it('deve excluir aviso se admin', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(prisma.announcement.delete as jest.Mock).mockResolvedValue(mockAnnouncement)

      const request = new NextRequest('http://localhost:3000/api/announcements/announcement-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'announcement-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Aviso excluído com sucesso')
    })

    it('deve retornar 403 se não for admin', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)

      const request = new NextRequest('http://localhost:3000/api/announcements/announcement-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'announcement-1' } })

      expect(response.status).toBe(403)
    })
  })
})
