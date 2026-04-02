import { CircleDot, Clock, Eye, CheckCircle2, Plus } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/types'
import type { ReactNode } from 'react'

const statusIcons: Record<TaskStatus, typeof CircleDot> = {
  todo: CircleDot,
  in_progress: Clock,
  in_review: Eye,
  done: CheckCircle2,
}

interface ColumnProps {
  id: TaskStatus
  title: string
  tasks: Task[]
  children: ReactNode
  isFiltered?: boolean
  onNewTask: () => void
}

export function Column({ id, title, tasks, children, isFiltered, onNewTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const StatusIcon = statusIcons[id]

  return (
    <div
      className={cn(
        'flex h-full w-72 shrink-0 flex-col rounded-xl bg-[#141416] transition-all md:w-72',
        'max-md:w-full max-md:shrink',
        isOver && 'shadow-[inset_3px_0_0_0_#7C3AED,0_0_16px_-4px_rgba(124,58,237,0.25)]',
      )}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="h-4 w-0.5 rounded-full bg-[#7C3AED]" />
        <h2 className="text-[13px] font-semibold text-[#F1F1F3]">{title}</h2>
        <span className="rounded-full bg-[#7C3AED]/15 px-2 py-0.5 text-[11px] font-medium text-[#7C3AED]">
          {isFiltered ? `${tasks.length} results` : tasks.length}
        </span>
        <button
          onClick={onNewTask}
          className="ml-auto rounded p-1 text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#F1F1F3] transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      <SortableContext
        id={id}
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2"
        >
          {tasks.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8">
              <StatusIcon size={24} className="text-[#71717A]" />
              <span className="text-center text-[13px] text-[#71717A]">
                Drop tasks here or click + to add one
              </span>
            </div>
          ) : (
            children
          )}
        </div>
      </SortableContext>
    </div>
  )
}
