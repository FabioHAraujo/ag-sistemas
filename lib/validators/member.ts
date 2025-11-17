import { z } from 'zod'

export const updateMemberSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  linkedinUrl: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
  isActive: z.boolean().optional(),
})

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirmação deve ter pelo menos 6 caracteres'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
