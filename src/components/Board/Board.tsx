import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { useTasks } from '@/hooks/useTasks'
import { getPositionBetween } from '@/lib/utils'
import { Column } from './Column'
import { TaskCard } from './TaskCard'
import type { Column as ColumnType, Task, TaskStatus } from '@/types'

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

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-red-500/30 bg-[#1C1C1F] px-4 py-3 text-sm text-red-400 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
      {message}
      <button
        onClick={onDismiss}
        className="text-[#71717A] hover:text-[#F1F1F3] transition-colors"
      >
        &times;
      </button>
    </div>
  )
}

function findColumnForTask(
  taskId: string,
  boardColumns: ColumnType[],
): TaskStatus | null {
  for (const col of boardColumns) {
    if (col.tasks.some((t) => t.id === taskId)) return col.id
  }
  return null
}

export function Board() {
  const { tasks, loading, moveTask } = useTasks()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const boardColumns: ColumnType[] = columns.map((col) => ({
    ...col,
    tasks: tasks
      .filter((t) => t.status === col.id)
      .sort((a, b) => a.position - b.position),
  }))

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined
    setActiveTask(task ?? null)
  }, [])

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Visual feedback is handled by Column's isOver ring
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null)
      const { active, over } = event
      if (!over) return

      const taskId = active.id as string
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      // Determine target column: over could be a column id or another task id
      let targetStatus: TaskStatus
      const columnIds = columns.map((c) => c.id)

      if (columnIds.includes(over.id as TaskStatus)) {
        targetStatus = over.id as TaskStatus
      } else {
        const found = findColumnForTask(over.id as string, boardColumns)
        if (!found) return
        targetStatus = found
      }

      // Get sorted tasks in target column (excluding the dragged task)
      const targetTasks = boardColumns
        .find((c) => c.id === targetStatus)!
        .tasks.filter((t) => t.id !== taskId)

      // Find insertion index based on where we dropped
      let insertIndex = targetTasks.length // default: end
      if (over.id !== targetStatus) {
        // Dropped on a specific task — insert at that task's index
        const overIndex = targetTasks.findIndex((t) => t.id === over.id)
        if (overIndex !== -1) insertIndex = overIndex
      }

      // Calculate position between neighbors
      const before = insertIndex > 0 ? targetTasks[insertIndex - 1].position : null
      const after =
        insertIndex < targetTasks.length
          ? targetTasks[insertIndex].position
          : null
      const newPosition = getPositionBetween(before, after)

      // Skip if nothing changed
      if (task.status === targetStatus && task.position === newPosition) return

      const success = await moveTask(taskId, targetStatus, newPosition)
      if (!success) {
        setToast('Failed to move task. Change has been reverted.')
        setTimeout(() => setToast(null), 3000)
      }
    },
    [tasks, boardColumns, moveTask],
  )

  if (loading) return <LoadingSkeleton />

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto px-6 py-4">
          {boardColumns.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={col.tasks}
            >
              {col.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </Column>
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </>
  )
}
