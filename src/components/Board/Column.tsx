import { Inbox } from 'lucide-react'
import type { Task } from '@/types'
import type { ReactNode } from 'react'

interface ColumnProps {
  title: string
  tasks: Task[]
  children: ReactNode
}

export function Column({ title, tasks, children }: ColumnProps) {
  return (
    <div className="flex h-full w-72 shrink-0 flex-col rounded-xl bg-[#141416]">
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="h-4 w-0.5 rounded-full bg-[#7C3AED]" />
        <h2 className="text-[13px] font-semibold text-[#F1F1F3]">{title}</h2>
        <span className="ml-auto rounded-full bg-[#7C3AED]/15 px-2 py-0.5 text-[11px] font-medium text-[#7C3AED]">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {tasks.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8">
            <Inbox size={24} className="text-[#71717A]" />
            <span className="text-[13px] text-[#71717A]">No tasks yet</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
