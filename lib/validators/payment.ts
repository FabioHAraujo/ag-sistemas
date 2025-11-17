import { z } from 'zod'

export const paymentSchema = z.object({
  membershipId: z.string().uuid('ID da associação inválido'),
  memberId: z.string().uuid('ID do membro inválido'),
  amount: z.number().positive('Valor deve ser positivo'),
  dueDate: z.string().datetime('Data de vencimento inválida'),
  paymentMethod: z.string().optional(),
})

export const updatePaymentSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  paidAt: z.string().datetime().optional(),
  paymentMethod: z.string().optional(),
})

export type PaymentFormData = z.infer<typeof paymentSchema>
export type UpdatePaymentData = z.infer<typeof updatePaymentSchema>
