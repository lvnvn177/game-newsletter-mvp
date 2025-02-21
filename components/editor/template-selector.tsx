'use client'

import { templates } from '@/lib/templates'
import type { Template } from '@/types/editor'

interface TemplateSelectorProps {
  onSelect: (template: Template) => void
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className="flex flex-col items-start rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:bg-blue-50"
        >
          <h3 className="mb-2 text-lg font-semibold">{template.name}</h3>
          <p className="text-sm text-gray-600">{template.description}</p>
        </button>
      ))}
    </div>
  )
} 