import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { fn } from 'storybook/test'
import { EntityCard } from './EntityCard'

const meta = {
  title: 'ProjectsCategories/EntityCard',
  component: EntityCard,
  parameters: {
    layout: 'centered',
  },
  args: {
    onEdit: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof EntityCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Système de Paiement',
    description: 'Gestion des paiements et transactions',
    createdAt: new Date('2025-03-12'),
    archiveCount: 8,
  },
}

export const WithoutDescription: Story = {
  args: {
    name: 'Infrastructure',
    createdAt: new Date('2025-06-01'),
    archiveCount: 0,
  },
}
