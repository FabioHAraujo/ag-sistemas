/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { DELETE, PATCH } from '@/app/api/one-on-ones/[id]/route'
import { GET, POST } from '@/app/api/one-on-ones/route'
import * as auth from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    oneOnOneMeeting: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth/get-current-user')

describe('OneOnOne Meetings API', () => {
  const mockMemberUser = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'member1@test.com',
    name: 'Member One',
    role: 'MEMBER' as const,
  }

  const mockMemberUser2 = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'member2@test.com',
    name: 'Member Two',
    role: 'MEMBER' as const,
  }

  const mockAdminUser = {
    id: '550e8400-e29b-41d4-a716-446655440099',
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'ADMIN' as const,
  }

  const mockOneOnOne = {
    id: 'oneonone-1',
    memberOneId: '550e8400-e29b-41d4-a716-446655440001',
    memberTwoId: '550e8400-e29b-41d4-a716-446655440002',
    meetingDate: new Date('2025-02-01T10:00:00Z'),
    location: 'Café Central',
    notes: 'Discutir parceria',
    status: 'SCHEDULED',
    createdAt: new Date(),
    updatedAt: new Date(),
    memberOne: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Member One',
      email: 'member1@test.com',
      profile: {
        company: 'Company A',
        position: 'Developer',
        profileImageUrl: null,
      },
    },
    memberTwo: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Member Two',
      email: 'member2@test.com',
      profile: {
        company: 'Company B',
        position: 'Designer',
        profileImageUrl: null,
      },
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/one-on-ones', () => {
    it('should create a 1-on-1 meeting', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockMemberUser2)
      ;(prisma.oneOnOneMeeting.create as jest.Mock).mockResolvedValue(mockOneOnOne)

      const request = new NextRequest('http://localhost:3000/api/one-on-ones', {
        method: 'POST',
        body: JSON.stringify({
          memberTwoId: '550e8400-e29b-41d4-a716-446655440002',
          meetingDate: '2025-02-01T10:00:00Z',
          location: 'Café Central',
          notes: 'Discutir parceria',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('meeting')
      expect(data.meeting).toHaveProperty('id')
      expect(data.meeting.memberOneId).toBe('550e8400-e29b-41d4-a716-446655440001')
      expect(data.meeting.memberTwoId).toBe('550e8400-e29b-41d4-a716-446655440002')
      expect(data.meeting.status).toBe('SCHEDULED')
    })

    it('should not allow creating meeting with yourself', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)

      const request = new NextRequest('http://localhost:3000/api/one-on-ones', {
        method: 'POST',
        body: JSON.stringify({
          memberTwoId: '550e8400-e29b-41d4-a716-446655440001', // mesmo ID do usuário logado
          meetingDate: '2025-02-01T10:00:00Z',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Não é possível agendar reunião consigo mesmo')
    })

    it('should return 404 for non-existent member', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/one-on-ones', {
        method: 'POST',
        body: JSON.stringify({
          memberTwoId: '550e8400-e29b-41d4-a716-446655440999',
          meetingDate: '2025-02-01T10:00:00Z',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Membro não encontrado')
    })

    it('should return 401 without authentication', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/one-on-ones', {
        method: 'POST',
        body: JSON.stringify({
          memberTwoId: 'member-2',
          meetingDate: '2025-02-01T10:00:00Z',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/one-on-ones', () => {
    it('should list 1-on-1 meetings for authenticated user', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.oneOnOneMeeting.findMany as jest.Mock).mockResolvedValue([mockOneOnOne])

      const request = new NextRequest('http://localhost:3000/api/one-on-ones', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('meetings')
      expect(Array.isArray(data.meetings)).toBe(true)
      expect(data.meetings.length).toBeGreaterThan(0)
      expect(data.meetings[0]).toHaveProperty('memberOne')
      expect(data.meetings[0]).toHaveProperty('memberTwo')
    })

    it('should filter by status', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.oneOnOneMeeting.findMany as jest.Mock).mockResolvedValue([mockOneOnOne])

      const request = new NextRequest('http://localhost:3000/api/one-on-ones?status=SCHEDULED', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('meetings')
      expect(Array.isArray(data.meetings)).toBe(true)
      expect(prisma.oneOnOneMeeting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SCHEDULED',
          }),
        })
      )
    })
  })

  describe('PATCH /api/one-on-ones/:id', () => {
    it('should update meeting status to COMPLETED', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.oneOnOneMeeting.findUnique as jest.Mock).mockResolvedValue(mockOneOnOne)
      ;(prisma.oneOnOneMeeting.update as jest.Mock).mockResolvedValue({
        ...mockOneOnOne,
        status: 'COMPLETED',
        notes: 'Reunião produtiva!',
      })

      const request = new NextRequest('http://localhost:3000/api/one-on-ones/oneonone-1', {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'COMPLETED',
          notes: 'Reunião produtiva!',
        }),
      })

      const response = await PATCH(request, {
        params: Promise.resolve({ id: 'oneonone-1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('meeting')
      expect(data.meeting.status).toBe('COMPLETED')
      expect(data.meeting.notes).toBe('Reunião produtiva!')
    })

    it('should allow both participants to update', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser2)
      ;(prisma.oneOnOneMeeting.findUnique as jest.Mock).mockResolvedValue(mockOneOnOne)
      ;(prisma.oneOnOneMeeting.update as jest.Mock).mockResolvedValue({
        ...mockOneOnOne,
        notes: 'Adiciono minhas observações',
      })

      const request = new NextRequest('http://localhost:3000/api/one-on-ones/oneonone-1', {
        method: 'PATCH',
        body: JSON.stringify({
          notes: 'Adiciono minhas observações',
        }),
      })

      const response = await PATCH(request, {
        params: Promise.resolve({ id: 'oneonone-1' }),
      })

      expect(response.status).toBe(200)
    })

    it('should return 403 for non-participant', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(prisma.oneOnOneMeeting.findUnique as jest.Mock).mockResolvedValue(mockOneOnOne)

      const request = new NextRequest('http://localhost:3000/api/one-on-ones/oneonone-1', {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'CANCELLED',
        }),
      })

      const response = await PATCH(request, {
        params: Promise.resolve({ id: 'oneonone-1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Acesso negado')
    })
  })

  describe('DELETE /api/one-on-ones/:id', () => {
    it('should allow creator to delete meeting', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.oneOnOneMeeting.findUnique as jest.Mock).mockResolvedValue(mockOneOnOne)
      ;(prisma.oneOnOneMeeting.delete as jest.Mock).mockResolvedValue(mockOneOnOne)

      const request = new NextRequest('http://localhost:3000/api/one-on-ones/oneonone-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'oneonone-1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Reunião removida com sucesso')
    })

    it('should not allow non-creator to delete', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser2)
      ;(prisma.oneOnOneMeeting.findUnique as jest.Mock).mockResolvedValue(mockOneOnOne)

      const request = new NextRequest('http://localhost:3000/api/one-on-ones/oneonone-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'oneonone-1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Apenas quem criou a reunião pode removê-la')
    })
  })
})
