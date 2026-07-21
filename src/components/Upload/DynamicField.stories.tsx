import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { useArgs } from 'storybook/preview-api'
import { DynamicField } from './DynamicField'

const meta = {
  title: 'Upload/DynamicField',
  component: DynamicField,
  parameters: {
    layout: 'padded',
  },
  args: {
    onChange: () => {},
  },
  render: function Render(args) {
    const [{ value }, updateArgs] = useArgs()
    return <DynamicField {...args} value={value} onChange={(next) => updateArgs({ value: next })} />
  },
} satisfies Meta<typeof DynamicField>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {
  args: {
    field: { key: 'browser', label: 'Navigateur', type: 'text', required: true },
    value: 'Chrome',
  },
}

export const EnumSelect: Story = {
  args: {
    field: {
      key: 'priority',
      label: 'Priorité',
      type: 'text',
      required: false,
      validation: { enum: ['low', 'medium', 'high'] },
    },
    value: 'medium',
  },
}

export const NumberInput: Story = {
  args: {
    field: {
      key: 'retries',
      label: 'Tentatives',
      type: 'number',
      required: false,
      validation: { min: 0, max: 5 },
    },
    value: 2,
  },
}

export const BooleanCheckbox: Story = {
  args: {
    field: { key: 'automated', label: 'Automatisé', type: 'boolean', required: false },
    value: true,
  },
}
