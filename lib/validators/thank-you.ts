import { z } from 'zod'

export const thankYouSchema = z.object({
  toMemberId: z.string().uuid('ID do membro inválido'),
  referralId: z.string().uuid().optional(),
  message: z
    .string()
    .min(10, 'Mensagem deve ter no mínimo 10 caracteres')
    .max(500, 'Mensagem deve ter no máximo 500 caracteres'),
  businessValue: z.number().positive('Valor deve ser positivo').optional(),
  isPublic: z.boolean().default(true),
})

export type ThankYouFormData = z.infer<typeof thankYouSchema>
