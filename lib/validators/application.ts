import { z } from 'zod'

export const applicationSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  company: z.string().min(2, 'Empresa deve ter pelo menos 2 caracteres'),
  motivation: z
    .string()
    .min(50, 'Conte-nos mais sobre sua motivação (mínimo 50 caracteres)')
    .max(1000, 'Motivação muito longa (máximo 1000 caracteres)'),
})

export type ApplicationFormData = z.infer<typeof applicationSchema>
