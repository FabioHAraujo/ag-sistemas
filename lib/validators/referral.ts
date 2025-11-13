import { z } from 'zod'

export const referralSchema = z.object({
  toMemberId: z.string().uuid('ID do membro inválido'),
  companyName: z.string().min(2, 'Nome da empresa deve ter no mínimo 2 caracteres'),
  contactName: z.string().min(2, 'Nome do contato deve ter no mínimo 2 caracteres'),
  contactEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  opportunityDescription: z
    .string()
    .min(20, 'Descrição deve ter no mínimo 20 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  estimatedValue: z.number().positive('Valor deve ser positivo').optional(),
  notes: z.string().max(500, 'Notas devem ter no máximo 500 caracteres').optional(),
})

export type ReferralFormData = z.infer<typeof referralSchema>

export const updateReferralStatusSchema = z.object({
  status: z.enum(['SENT', 'CONTACTED', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST']),
  comment: z.string().max(500).optional(),
  closedValue: z.number().positive().optional(),
})

export type UpdateReferralStatusData = z.infer<typeof updateReferralStatusSchema>
