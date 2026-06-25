import { SimpleGrid, Text } from '@mantine/core'
import type { Category, Project } from '../../types/api'
import { EntityCard } from './EntityCard'

interface EntityGridProps<T extends Project | Category> {
  items: T[]
  emptyMessage: string
  archiveCount: (entityId: string) => number
  onEdit: (entity: T) => void
  onDelete: (entity: T) => void
}

export function EntityGrid<T extends Project | Category>({
  items,
  emptyMessage,
  archiveCount,
  onEdit,
  onDelete,
}: EntityGridProps<T>) {
  if (items.length === 0) {
    return <Text c="#717182">{emptyMessage}</Text>
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {items.map((item) => (
        <EntityCard
          key={item.id}
          name={item.name}
          description={item.description}
          createdAt={item.createdAt}
          archiveCount={archiveCount(item.id)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      ))}
    </SimpleGrid>
  )
}
