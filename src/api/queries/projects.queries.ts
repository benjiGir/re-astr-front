import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateProjectDto, UpdateProjectDto } from '../../types/api'
import * as projectsApi from '../services/projects.service'

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
}

/**
 * Get all projects
 */
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: projectsApi.getAllProjects,
  })
}

/**
 * Get project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getProjectById(id),
    enabled: !!id,
  })
}

/**
 * Create a project
 */
export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateProjectDto) => projectsApi.createProject(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

/**
 * Update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProjectDto }) =>
      projectsApi.updateProject(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

/**
 * Delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}
