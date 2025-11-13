import { z } from 'zod'

export const announcementSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(200),
  content: z.string().min(10, 'Conteúdo deve ter no mínimo 10 caracteres'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  targetAudience: z.enum(['ALL', 'MEMBERS', 'ADMINS']).default('ALL'),
  published: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
})

export type AnnouncementFormData = z.infer<typeof announcementSchema>
