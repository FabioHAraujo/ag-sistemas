import { NextRequest } from 'next/server'
import {
  GET as GET_ATTENDANCE,
  POST as POST_ATTENDANCE,
} from '@/app/api/meetings/[id]/attendance/route'
import { GET, POST } from '@/app/api/meetings/route'
import * as auth from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    meeting: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    meetingAttendance: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth/get-current-user')

describe('Meetings API', () => {
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

  const mockMeeting = {
    id: 'meeting-1',
    title: 'Reunião Semanal',
    description: 'Reunião semanal do grupo',
    meetingDate: new Date('2025-11-15T10:00:00'),
    location: 'Sala de Reuniões',
    type: 'REGULAR' as const,
    status: 'SCHEDULED' as const,
    createdBy: 'admin-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@test.com',
    },
    attendances: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/meetings', () => {
    it('deve retornar reuniões para usuário autenticado', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.meeting.findMany as jest.Mock).mockResolvedValue([mockMeeting])

      const request = new NextRequest('http://localhost:3000/api/meetings')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].title).toBe('Reunião Semanal')
    })

    it('deve filtrar reuniões futuras quando upcoming=true', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.meeting.findMany as jest.Mock).mockResolvedValue([mockMeeting])

      const request = new NextRequest('http://localhost:3000/api/meetings?upcoming=true')
      const _response = await GET(request)

      expect(prisma.meeting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            meetingDate: { gte: expect.any(Date) },
          }),
        })
      )
    })

    it('deve retornar 401 se não autenticado', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/meetings')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/meetings', () => {
    it('deve criar reunião se admin', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(prisma.meeting.create as jest.Mock).mockResolvedValue(mockMeeting)

      const request = new NextRequest('http://localhost:3000/api/meetings', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Reunião Semanal',
          description: 'Reunião semanal do grupo',
          meetingDate: '2025-11-15T10:00:00',
          location: 'Sala de Reuniões',
          type: 'REGULAR',
          status: 'SCHEDULED',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.title).toBe('Reunião Semanal')
    })

    it('deve retornar 403 se não for admin', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)

      const request = new NextRequest('http://localhost:3000/api/meetings', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test',
          meetingDate: '2025-11-15T10:00:00',
          type: 'REGULAR',
          status: 'SCHEDULED',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(403)
    })
  })

  describe('POST /api/meetings/:id/attendance', () => {
    const mockAttendance = {
      id: 'attendance-1',
      meetingId: 'meeting-1',
      memberId: 'member-1',
      status: 'PRESENT' as const,
      checkedInAt: new Date(),
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      member: {
        id: 'member-1',
        name: 'Member User',
        email: 'member@test.com',
      },
      meeting: {
        id: 'meeting-1',
        title: 'Reunião Semanal',
        meetingDate: new Date('2025-11-15T10:00:00'),
      },
    }

    it('deve registrar presença do próprio membro', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting)
      ;(prisma.meetingAttendance.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.meetingAttendance.create as jest.Mock).mockResolvedValue(mockAttendance)

      const request = new NextRequest('http://localhost:3000/api/meetings/meeting-1/attendance', {
        method: 'POST',
        body: JSON.stringify({
          status: 'PRESENT',
        }),
      })

      const response = await POST_ATTENDANCE(request, { params: { id: 'meeting-1' } })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.status).toBe('PRESENT')
      expect(prisma.meetingAttendance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            memberId: 'member-1',
            status: 'PRESENT',
          }),
        })
      )
    })

    it('deve atualizar presença existente', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting)
      ;(prisma.meetingAttendance.findUnique as jest.Mock).mockResolvedValue(mockAttendance)
      ;(prisma.meetingAttendance.update as jest.Mock).mockResolvedValue({
        ...mockAttendance,
        status: 'LATE',
      })

      const request = new NextRequest('http://localhost:3000/api/meetings/meeting-1/attendance', {
        method: 'POST',
        body: JSON.stringify({
          status: 'LATE',
        }),
      })

      const response = await POST_ATTENDANCE(request, { params: { id: 'meeting-1' } })

      expect(response.status).toBe(200)
      expect(prisma.meetingAttendance.update).toHaveBeenCalled()
    })

    it('deve retornar 404 se reunião não encontrada', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.meeting.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/meetings/invalid-id/attendance', {
        method: 'POST',
        body: JSON.stringify({
          status: 'PRESENT',
        }),
      })

      const response = await POST_ATTENDANCE(request, { params: { id: 'invalid-id' } })

      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/meetings/:id/attendance', () => {
    it('deve listar presenças da reunião', async () => {
      const mockAttendances = [
        {
          id: 'attendance-1',
          meetingId: 'meeting-1',
          memberId: 'member-1',
          status: 'PRESENT' as const,
          checkedInAt: new Date(),
          member: {
            id: 'member-1',
            name: 'Member User',
            email: 'member@test.com',
          },
        },
      ]

      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockMemberUser)
      ;(prisma.meetingAttendance.findMany as jest.Mock).mockResolvedValue(mockAttendances)

      const request = new NextRequest('http://localhost:3000/api/meetings/meeting-1/attendance')
      const response = await GET_ATTENDANCE(request, { params: { id: 'meeting-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].status).toBe('PRESENT')
    })
  })
})
