export type ArchiveStatus = 'active' | 'in_progress' | 'completed'

export interface Archive {
  id: string
  title: string
  category: string
  testType: string
  date: string
  size: string
  status: ArchiveStatus
}

export interface DashboardStats {
  totalArchives: {
    value: number
    variation: string
  }
  monthlyUploads: {
    value: number
    variation: string
  }
  activeProjects: {
    value: number
    variation: string
  }
  totalSize: {
    value: string
    variation: string
  }
}