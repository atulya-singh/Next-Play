import { useTasks } from '@/hooks/useTasks'
import { Column } from './Column'
import { TaskCard } from './TaskCard'
import type { Column as ColumnType, TaskStatus } from '@/types'

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'done', title: 'Done' },
]

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-[#2A2A2E] bg-[#1C1C1F] p-3">
      <div className="h-4 w-3/4 rounded bg-[#2A2A2E]" />
      <div className="mt-3 h-3 w-1/2 rounded bg-[#2A2A2E]" />
      <div className="mt-3 h-3 w-1/3 rounded bg-[#2A2A2E]" />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto px-6 py-4">
      {columns.map((col) => (
        <div
          key={col.id}
          className="flex w-72 shrink-0 flex-col rounded-xl bg-[#141416]"
        >
          <div className="flex items-center gap-2 px-3 py-3">
            <div className="h-4 w-0.5 rounded-full bg-[#7C3AED]" />
            <div className="h-4 w-20 animate-pulse rounded bg-[#2A2A2E]" />
          </div>
          <div className="flex flex-col gap-2 px-2 pb-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Board() {
  const { tasks, loading } = useTasks()

  if (loading) return <LoadingSkeleton />

  const boardColumns: ColumnType[] = columns.map((col) => ({
    ...col,
    tasks: tasks
      .filter((t) => t.status === col.id)
      .sort((a, b) => a.position - b.position),
  }))

  return (
    <div className="flex flex-1 gap-4 overflow-x-auto px-6 py-4">
      {boardColumns.map((col) => (
        <Column key={col.id} title={col.title} tasks={col.tasks}>
          {col.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Column>
      ))}
    </div>
  )
}
