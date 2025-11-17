import { z } from 'zod'

export const membershipSchema = z.object({
  memberId: z.string().uuid('ID de membro inválido'),
  planType: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']),
  amount: z.number().positive('Valor deve ser positivo'),
  startDate: z.string().datetime('Data de início inválida'),
  endDate: z.string().datetime('Data de fim inválida').optional(),
})

export const updateMembershipSchema = z.object({
  planType: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']).optional(),
  amount: z.number().positive().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'CANCELLED']).optional(),
  endDate: z.string().datetime().optional(),
})

export type MembershipFormData = z.infer<typeof membershipSchema>
export type UpdateMembershipData = z.infer<typeof updateMembershipSchema>
