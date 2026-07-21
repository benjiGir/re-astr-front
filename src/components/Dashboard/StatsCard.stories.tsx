import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { IconArchive } from '@tabler/icons-react'
import { StatsCard } from './StatsCard'

const meta = {
  title: 'Dashboard/StatsCard',
  component: StatsCard,
  parameters: {
    layout: 'centered',
  },
  args: {
    icon: <IconArchive size={16} />,
  },
} satisfies Meta<typeof StatsCard>

export default meta
type Story = StoryObj<typeof meta>

export const Positive: Story = {
  args: {
    title: 'Total des Archives',
    value: 128,
    description: '+12% vs mois dernier',
    variant: 'positive',
  },
}

export const Neutral: Story = {
  args: {
    title: 'Projets Actifs',
    value: 6,
    description: '+2 nouveaux projets',
    variant: 'neutral',
  },
}
