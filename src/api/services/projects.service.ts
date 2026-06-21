import type { Project } from '../../types/api'
import { apiFetch } from '../http'

export async function getAllProjects(): Promise<Project[]> {
  return apiFetch<Project[]>('/projects')
}

export async function getProjectById(id: string): Promise<Project> {
  return apiFetch<Project>(`/projects/${id}`)
}
