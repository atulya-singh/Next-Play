import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Label } from '@/types'

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F1F5F9', '#71717A',
]

interface LabelPickerProps {
  allLabels: Label[]
  selectedLabelIds: string[]
  onToggleLabel: (labelId: string) => void
  onCreateLabel: (name: string, color: string) => Promise<Label | null>
}

export function LabelPicker({
  allLabels,
  selectedLabelIds,
  onToggleLabel,
  onCreateLabel,
}: LabelPickerProps) {
  const [showForm, setShowForm] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0])

  const resetForm = () => {
    setNewLabelName('')
    setNewLabelColor(PRESET_COLORS[0])
    setShowForm(false)
  }

  const handleCreate = async () => {
    if (!newLabelName.trim()) return
    const label = await onCreateLabel(newLabelName.trim(), newLabelColor)
    if (label) {
      onToggleLabel(label.id)
    }
    resetForm()
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {allLabels.map((label) => {
          const isSelected = selectedLabelIds.includes(label.id)
          return (
            <button
              key={label.id}
              type="button"
              onClick={() => onToggleLabel(label.id)}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
                isSelected
                  ? 'ring-1 ring-offset-1 ring-offset-[#141416]'
                  : 'opacity-50 hover:opacity-80',
              )}
              style={{
                backgroundColor: `${label.color}25`,
                color: label.color,
                ringColor: isSelected ? label.color : undefined,
              }}
            >
              {label.name}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-1 rounded-full border border-dashed border-[#2A2A2E] px-2.5 py-1 text-[11px] text-[#71717A] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
        >
          <Plus size={10} />
          New Label
        </button>
      </div>

      {showForm && (
        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-[#2A2A2E] bg-[#1C1C1F] p-3">
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="Label name..."
            className="w-full rounded border border-[#2A2A2E] bg-[#141416] px-2.5 py-1.5 text-[12px] text-[#F1F1F3] placeholder:text-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCreate()
              }
            }}
          />

          <div className="flex items-center gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewLabelColor(color)}
                className={cn(
                  'h-5 w-5 rounded-full transition-transform',
                  newLabelColor === color && 'scale-125 ring-1 ring-white/40',
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded bg-[#7C3AED] px-3 py-1 text-[12px] font-medium text-white hover:bg-[#6D28D9] transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded px-3 py-1 text-[12px] text-[#71717A] hover:text-[#F1F1F3] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
