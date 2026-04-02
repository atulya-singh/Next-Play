import { useState, useEffect, type FormEvent } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTasks } from '@/hooks/useTasks'
import { useLabels } from '@/hooks/useLabels'
import type { Task, TaskPriority, TaskStatus } from '@/types'

const LABEL_COLORS = [
  '#EF4444', '#F59E0B', '#22C55E', '#3B82F6',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
]

interface TaskModalProps {
  open: boolean
  onClose: () => void
  defaultStatus: TaskStatus
  editTask?: Task | null
}

export function TaskModal({ open, onClose, defaultStatus, editTask }: TaskModalProps) {
  const { createTask, updateTask, deleteTask } = useTasks()
  const { labels: allLabels, createLabel } = useLabels()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [dueDate, setDueDate] = useState('')
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const [titleError, setTitleError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // New label inline form
  const [showNewLabel, setShowNewLabel] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0])

  const isEdit = !!editTask

  useEffect(() => {
    if (open) {
      if (editTask) {
        setTitle(editTask.title)
        setDescription(editTask.description ?? '')
        setPriority(editTask.priority)
        setDueDate(editTask.due_date ?? '')
        setSelectedLabelIds(editTask.labels.map((l) => l.id))
      } else {
        setTitle('')
        setDescription('')
        setPriority('normal')
        setDueDate('')
        setSelectedLabelIds([])
      }
      setTitleError('')
      setConfirmDelete(false)
      setShowNewLabel(false)
    }
  }, [open, editTask])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setTitleError('Title is required')
      return
    }

    setSubmitting(true)
    if (isEdit) {
      await updateTask(
        editTask.id,
        {
          title: trimmed,
          description: description.trim() || null,
          priority,
          due_date: dueDate || null,
        },
        selectedLabelIds,
      )
    } else {
      await createTask({
        title: trimmed,
        status: defaultStatus,
        priority,
        description: description.trim() || null,
        due_date: dueDate || null,
        label_ids: selectedLabelIds,
      })
    }
    setSubmitting(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    if (!editTask) return
    setSubmitting(true)
    await deleteTask(editTask.id)
    setSubmitting(false)
    onClose()
  }

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId],
    )
  }

  const handleCreateLabel = async () => {
    const name = newLabelName.trim()
    if (!name) return
    const label = await createLabel(name, newLabelColor)
    if (label) {
      setSelectedLabelIds((prev) => [...prev, label.id])
      setNewLabelName('')
      setShowNewLabel(false)
    }
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full flex-col',
          'border-l border-[#2A2A2E] bg-[#141416]',
          'sm:w-[420px]',
          'animate-in slide-in-from-right duration-200',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A2E] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#F1F1F3]">
            {isEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#F1F1F3] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-1 flex-col gap-5 px-5 py-5">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#71717A]">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (titleError) setTitleError('')
                }}
                placeholder="Task title..."
                className={cn(
                  'w-full rounded-lg border bg-[#1C1C1F] px-3 py-2 text-sm text-[#F1F1F3]',
                  'placeholder:text-[#71717A] focus:outline-none focus:ring-1',
                  titleError
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[#2A2A2E] focus:ring-[#7C3AED]',
                )}
                autoFocus
              />
              {titleError && (
                <p className="mt-1 text-[12px] text-red-400">{titleError}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#71717A]">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Add a description..."
                className="w-full resize-none rounded-lg border border-[#2A2A2E] bg-[#1C1C1F] px-3 py-2 text-sm text-[#F1F1F3] placeholder:text-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#71717A]">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-[#2A2A2E] bg-[#1C1C1F] px-3 py-2 text-sm text-[#F1F1F3] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#71717A]">
                Due date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-[#2A2A2E] bg-[#1C1C1F] px-3 py-2 text-sm text-[#F1F1F3] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] [color-scheme:dark]"
              />
            </div>

            {/* Labels */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#71717A]">
                Labels
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allLabels.map((label) => {
                  const selected = selectedLabelIds.includes(label.id)
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
                        selected
                          ? 'ring-1 ring-offset-1 ring-offset-[#141416]'
                          : 'opacity-50 hover:opacity-80',
                      )}
                      style={{
                        backgroundColor: `${label.color}25`,
                        color: label.color,
                        ringColor: selected ? label.color : undefined,
                      }}
                    >
                      {label.name}
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setShowNewLabel(!showNewLabel)}
                  className="flex items-center gap-1 rounded-full border border-dashed border-[#2A2A2E] px-2.5 py-1 text-[11px] text-[#71717A] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
                >
                  <Plus size={10} />
                  New
                </button>
              </div>

              {showNewLabel && (
                <div className="mt-3 flex flex-col gap-2 rounded-lg border border-[#2A2A2E] bg-[#1C1C1F] p-3">
                  <input
                    type="text"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label name..."
                    className="w-full rounded border border-[#2A2A2E] bg-[#141416] px-2.5 py-1.5 text-[12px] text-[#F1F1F3] placeholder:text-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
                    autoFocus
                  />
                  <div className="flex items-center gap-1.5">
                    {LABEL_COLORS.map((color) => (
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
                      onClick={handleCreateLabel}
                      className="rounded bg-[#7C3AED] px-3 py-1 text-[12px] font-medium text-white hover:bg-[#6D28D9] transition-colors"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewLabel(false)}
                      className="rounded px-3 py-1 text-[12px] text-[#71717A] hover:text-[#F1F1F3] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center border-t border-[#2A2A2E] px-5 py-4">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className={cn(
                  'flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] font-medium transition-colors',
                  confirmDelete
                    ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                    : 'text-red-400 hover:bg-red-500/10',
                )}
              >
                <Trash2 size={12} />
                {confirmDelete ? 'Click again to confirm' : 'Delete'}
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-[13px] text-[#71717A] hover:text-[#F1F1F3] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#7C3AED] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#6D28D9] disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Saving...' : isEdit ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
