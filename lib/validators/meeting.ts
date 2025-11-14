import { z } from 'zod'

export const meetingSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  meetingDate: z.string().datetime('Data inválida'),
  location: z.string().optional(),
  type: z.enum(['REGULAR', 'SPECIAL', 'ONE_ON_ONE']),
})

export type MeetingFormData = z.infer<typeof meetingSchema>

export const attendanceSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'EXCUSED', 'LATE']),
  notes: z.string().max(500).optional(),
  memberId: z.string().uuid().optional(), // Somente admin pode fornecer
})

export type AttendanceFormData = z.infer<typeof attendanceSchema>

export const oneOnOneMeetingSchema = z.object({
  memberTwoId: z.string().uuid(),
  meetingDate: z.string().datetime(),
  location: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export type OneOnOneMeetingFormData = z.infer<typeof oneOnOneMeetingSchema>
