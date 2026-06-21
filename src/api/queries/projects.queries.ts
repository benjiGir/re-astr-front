import { useQuery } from '@tanstack/react-query'
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
