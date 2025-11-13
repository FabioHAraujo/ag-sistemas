import { z } from 'zod'

export const registrationSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
      .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
    confirmPassword: z.string(),
    phone: z
      .string()
      .min(10, 'Telefone inválido')
      .regex(/^\+?[1-9]\d{1,14}$/, 'Telefone inválido'),
    position: z.string().min(2, 'Cargo/posição deve ter pelo menos 2 caracteres'),
    bio: z
      .string()
      .min(50, 'Biografia deve ter pelo menos 50 caracteres')
      .max(500, 'Biografia muito longa (máximo 500 caracteres)')
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type RegistrationFormData = z.infer<typeof registrationSchema>
