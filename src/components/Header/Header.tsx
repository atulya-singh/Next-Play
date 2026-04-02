import { Search, Plus } from 'lucide-react'
import type { Task, TaskPriority } from '@/types'

interface HeaderProps {
  tasks: Task[]
  filterText: string
  onFilterTextChange: (text: string) => void
  filterPriority: TaskPriority | 'all'
  onFilterPriorityChange: (priority: TaskPriority | 'all') => void
  onNewTask: () => void
}

export function Header({
  tasks,
  filterText,
  onFilterTextChange,
  filterPriority,
  onFilterPriorityChange,
  onNewTask,
}: HeaderProps) {
  const totalTasks = tasks.length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length
  const overdueCount = tasks.filter((t) => {
    if (!t.due_date) return false
    return new Date(t.due_date) < new Date()
  }).length

  return (
    <header className="sticky top-0 z-10 border-b border-[#2A2A2E] bg-[#0D0D0F] px-6">
      <div className="flex h-14 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-[#7C3AED]" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#F1F1F3]">Kanban</span>
            <span className="hidden text-xs text-[#71717A] md:block">
              {totalTasks} tasks &middot; {inProgressCount} in progress &middot; {overdueCount} overdue
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search..."
              value={filterText}
              onChange={(e) => onFilterTextChange(e.target.value)}
              className="h-9 w-32 rounded-lg border border-[#2A2A2E] bg-[#1C1C1F] pl-9 pr-3 text-sm text-[#F1F1F3] placeholder-[#71717A] outline-none focus:border-[#7C3AED] md:w-auto"
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => onFilterPriorityChange(e.target.value as TaskPriority | 'all')}
            className="hidden h-9 rounded-lg border border-[#2A2A2E] bg-[#1C1C1F] px-3 text-sm text-[#F1F1F3] outline-none focus:border-[#7C3AED] md:block"
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>

          <button
            onClick={onNewTask}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[#7C3AED] px-3 text-sm font-medium text-white hover:bg-[#6D28D9] md:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">New Task</span>
          </button>
        </div>
      </div>
    </header>
  )
}
