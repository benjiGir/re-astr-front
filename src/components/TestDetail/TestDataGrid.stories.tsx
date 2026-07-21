import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { TestDataGrid } from './TestDataGrid'

const meta = {
  title: 'TestDetail/TestDataGrid',
  component: TestDataGrid,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof TestDataGrid>

export default meta
type Story = StoryObj<typeof meta>

export const WithSchema: Story = {
  args: {
    fields: [
      { key: 'browser', label: 'Navigateur', type: 'text', required: true },
      { key: 'version', label: 'Version', type: 'text', required: false },
      { key: 'automated', label: 'Automatisé', type: 'boolean', required: false },
      { key: 'executedAt', label: "Date d'exécution", type: 'date', required: false },
    ],
    data: {
      browser: 'Chrome',
      version: '128.0',
      automated: true,
      executedAt: '2026-06-15',
    },
  },
}

export const WithoutSchema: Story = {
  args: {
    data: {
      environment: 'staging',
      retries: 2,
      tags: ['smoke', 'critical'],
    },
  },
}

export const Empty: Story = {
  args: {
    fields: [{ key: 'notes', label: 'Notes', type: 'text', required: false }],
    data: {},
  },
}
