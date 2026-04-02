import { GripVertical, Clock, AlertTriangle } from 'lucide-react'
import { format, isPast, differenceInDays, parseISO } from 'date-fns'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

const priorityConfig = {
  high: { label: 'High', color: '#EF4444' },
  normal: { label: 'Normal', color: '#F59E0B' },
  low: { label: 'Low', color: '#6B7280' },
} as const

function DueDateBadge({ dueDate }: { dueDate: string }) {
  const date = parseISO(dueDate)
  const now = new Date()
  const overdue = isPast(date) && date.toDateString() !== now.toDateString()
  const dueSoon = !overdue && differenceInDays(date, now) <= 2

  if (overdue) {
    return (
      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium bg-red-500/15 text-red-400">
        <AlertTriangle size={11} />
        Overdue
      </span>
    )
  }

  if (dueSoon) {
    return (
      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium bg-amber-500/15 text-amber-400">
        <Clock size={11} />
        {format(date, 'MMM d')}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-[#71717A]">
      <Clock size={11} />
      {format(date, 'MMM d')}
    </span>
  )
}

export function TaskCard({
  task,
  isOverlay,
  onClick,
}: {
  task: Task
  isOverlay?: boolean
  onClick?: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  }

  const priority = priorityConfig[task.priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => {
        if (!isDragging && onClick) onClick()
      }}
      className={cn(
        'group rounded-lg border border-[#2A2A2E] bg-[#1C1C1F] p-3',
        'transition-all duration-150',
        'hover:bg-[#222226] hover:-translate-y-[1px]',
        'hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)]',
        isOverlay && 'rotate-[2deg] shadow-[0_8px_24px_rgba(0,0,0,0.5)]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-[#F1F1F3] leading-snug">
          {task.title}
        </h3>
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium"
          style={{
            backgroundColor: `${priority.color}20`,
            color: priority.color,
          }}
        >
          {priority.label}
        </span>
      </div>

      {task.due_date && (
        <div className="mt-2">
          <DueDateBadge dueDate={task.due_date} />
        </div>
      )}

      {task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: `${label.color}25`,
                color: label.color,
              }}
            >
              {label.name}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-[#71717A]">
              +{task.labels.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-[#71717A]">
          {format(parseISO(task.created_at), 'MMM d')}
        </span>
        <button
          className="cursor-grab touch-none active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical
            size={14}
            className="text-[#71717A] opacity-0 transition-opacity group-hover:opacity-100"
          />
        </button>
      </div>
    </div>
  )
}
