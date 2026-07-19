import { Checkbox, NumberInput, Select, TextInput, Textarea } from '@mantine/core'
import type { FieldDefinition } from '../../types/api'

interface DynamicFieldProps {
  field: FieldDefinition
  value: any
  onChange: (value: any) => void
  error?: string
}

export function DynamicField({ field, value, onChange, error }: DynamicFieldProps) {
  const commonProps = {
    label: field.label,
    required: field.required,
    error,
  }

  switch (field.type) {
    case 'number':
      return (
        <NumberInput
          {...commonProps}
          value={value ?? field.defaultValue}
          onChange={onChange}
          min={field.validation?.min}
          max={field.validation?.max}
        />
      )

    case 'text':
      // If enum is defined, use Select
      if (field.validation?.enum) {
        return (
          <Select
            {...commonProps}
            value={value ?? field.defaultValue}
            onChange={onChange}
            data={field.validation.enum}
          />
        )
      }

      // If has minLength/maxLength constraints, use Textarea for longer text
      if (field.validation?.minLength && field.validation.minLength > 100) {
        return (
          <Textarea
            {...commonProps}
            value={value ?? field.defaultValue ?? ''}
            onChange={(e) => onChange(e.currentTarget.value)}
            minRows={3}
            minLength={field.validation.minLength}
            maxLength={field.validation.maxLength}
          />
        )
      }

      return (
        <TextInput
          {...commonProps}
          value={value ?? field.defaultValue ?? ''}
          onChange={(e) => onChange(e.currentTarget.value)}
          minLength={field.validation?.minLength}
          maxLength={field.validation?.maxLength}
        />
      )

    case 'email':
      return (
        <TextInput
          {...commonProps}
          type="email"
          value={value ?? field.defaultValue ?? ''}
          onChange={(e) => onChange(e.currentTarget.value)}
          minLength={field.validation?.minLength}
          maxLength={field.validation?.maxLength}
        />
      )

    case 'url':
      return (
        <TextInput
          {...commonProps}
          type="url"
          value={value ?? field.defaultValue ?? ''}
          onChange={(e) => onChange(e.currentTarget.value)}
          minLength={field.validation?.minLength}
          maxLength={field.validation?.maxLength}
        />
      )

    case 'boolean':
      return (
        <Checkbox
          label={field.label}
          checked={value ?? field.defaultValue ?? false}
          onChange={(e) => onChange(e.currentTarget.checked)}
          error={error}
        />
      )

    case 'date':
      return (
        <TextInput
          {...commonProps}
          type="date"
          value={value ?? field.defaultValue ?? ''}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      )

    case 'array':
    case 'object':
      // Pour les types complexes, on utilise un textarea avec JSON
      // TODO: Améliorer avec un éditeur JSON dédié si nécessaire
      return (
        <Textarea
          {...commonProps}
          value={
            value
              ? JSON.stringify(value, null, 2)
              : field.defaultValue
                ? JSON.stringify(field.defaultValue, null, 2)
                : ''
          }
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.currentTarget.value)
              onChange(parsed)
            } catch {
              // Ignore invalid JSON while typing
            }
          }}
          minRows={3}
          placeholder={field.type === 'array' ? '[]' : '{}'}
        />
      )

    default:
      return null
  }
}
