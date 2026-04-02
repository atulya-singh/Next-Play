import { Inbox, Plus } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { Task, TaskStatus } from '@/types'
import type { ReactNode } from 'react'

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

  return (
    <div
      className={`flex h-full w-72 shrink-0 flex-col rounded-xl bg-[#141416] transition-colors ${
        isOver ? 'ring-1 ring-[#7C3AED]/40' : ''
      }`}
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
              <Inbox size={24} className="text-[#71717A]" />
              <span className="text-[13px] text-[#71717A]">No tasks yet</span>
            </div>
          ) : (
            children
          )}
        </div>
      </SortableContext>
    </div>
  )
}
