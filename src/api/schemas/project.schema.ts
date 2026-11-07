import { z } from 'zod'

export const ProjectSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Project = z.infer<typeof ProjectSchema>

export const CreateProjectDtoSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})
export type CreateProjectDto = z.infer<typeof CreateProjectDtoSchema>

export const UpdateProjectDtoSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
})
export type UpdateProjectDto = z.infer<typeof UpdateProjectDtoSchema>
