import type { QueryClient } from '@tanstack/react-query'
import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { CreateProjectDto, Project, UpdateProjectDto } from '../../types/api'
import * as projectsApi from '../services/projects.service'

const REFERENCE_DATA_STALE_TIME = 10 * 60 * 1000

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
}

export function projectsOptions() {
  return queryOptions({
    queryKey: projectKeys.all,
    queryFn: ({ signal }) => projectsApi.getAllProjects(signal),
    staleTime: REFERENCE_DATA_STALE_TIME,
  })
}

export function projectOptions(id: string) {
  return queryOptions({
    queryKey: projectKeys.detail(id),
    queryFn: ({ signal }) => projectsApi.getProjectById(id, signal),
    enabled: !!id,
    staleTime: REFERENCE_DATA_STALE_TIME,
  })
}

function invalidateProjects(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: projectKeys.all })
}

interface ProjectsRollback {
  previous?: Project[]
}

function createProjectMutation(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (dto: CreateProjectDto) => projectsApi.createProject(dto),
    onMutate: async (dto): Promise<ProjectsRollback> => {
      await queryClient.cancelQueries({ queryKey: projectKeys.all })
      const previous = queryClient.getQueryData<Project[]>(projectKeys.all)
      const optimisticProject: Project = {
        id: `temp-${Date.now()}`,
        name: dto.name,
        description: dto.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      queryClient.setQueryData<Project[]>(projectKeys.all, (old) => [
        ...(old ?? []),
        optimisticProject,
      ])
      return { previous }
    },
    onError: (_error, _dto, context) => {
      if (context?.previous) queryClient.setQueryData(projectKeys.all, context.previous)
    },
    onSettled: () => invalidateProjects(queryClient),
  })
}

function updateProjectMutation(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProjectDto }) =>
      projectsApi.updateProject(id, dto),
    onMutate: async ({ id, dto }): Promise<ProjectsRollback> => {
      await queryClient.cancelQueries({ queryKey: projectKeys.all })
      const previous = queryClient.getQueryData<Project[]>(projectKeys.all)
      queryClient.setQueryData<Project[]>(projectKeys.all, (old) =>
        old?.map((project) =>
          project.id === id ? { ...project, ...dto, updatedAt: new Date() } : project,
        ),
      )
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(projectKeys.all, context.previous)
    },
    onSettled: () => invalidateProjects(queryClient),
  })
}

function deleteProjectMutation(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onMutate: async (id): Promise<ProjectsRollback> => {
      await queryClient.cancelQueries({ queryKey: projectKeys.all })
      const previous = queryClient.getQueryData<Project[]>(projectKeys.all)
      queryClient.setQueryData<Project[]>(projectKeys.all, (old) =>
        old?.filter((project) => project.id !== id),
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(projectKeys.all, context.previous)
    },
    onSettled: () => invalidateProjects(queryClient),
  })
}

/**
 * Combined query + mutations for managing the projects list
 */
export function useProjectsResource() {
  const queryClient = useQueryClient()
  return {
    query: useQuery(projectsOptions()),
    create: useMutation(createProjectMutation(queryClient)),
    update: useMutation(updateProjectMutation(queryClient)),
    remove: useMutation(deleteProjectMutation(queryClient)),
  }
}
