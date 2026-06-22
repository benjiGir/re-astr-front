import type { CreateProjectDto, Project, UpdateProjectDto } from '../../types/api'
import { apiFetch } from '../http'

export async function getAllProjects(): Promise<Project[]> {
  return apiFetch<Project[]>('/projects')
}

export async function getProjectById(id: string): Promise<Project> {
  return apiFetch<Project>(`/projects/${id}`)
}

export async function createProject(dto: CreateProjectDto): Promise<Project> {
  return apiFetch<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export async function updateProject(id: string, dto: UpdateProjectDto): Promise<Project> {
  return apiFetch<Project>(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  })
}

export async function deleteProject(id: string): Promise<void> {
  return apiFetch<void>(`/projects/${id}`, {
    method: 'DELETE',
  })
}
