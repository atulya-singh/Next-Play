import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Task, TaskPriority, TaskStatus } from '@/types'

export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('tasks')
      .select('*, task_labels(label_id, labels(*))')
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    if (error) {
      console.error('Failed to fetch tasks:', error)
      setError(error.message)
    } else {
      const mapped = (data ?? []).map((row) => ({
        ...row,
        labels: (row.task_labels ?? []).map(
          (tl: { labels: Record<string, unknown> }) => tl.labels,
        ),
        task_labels: undefined,
      })) as Task[]
      setTasks(mapped)
      setError(null)
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = useCallback(
    async (fields: {
      title: string
      status?: TaskStatus
      priority?: TaskPriority
      description?: string | null
      due_date?: string | null
      label_ids?: string[]
    }) => {
      if (!user) return null

      const status = fields.status ?? 'todo'
      const priority = fields.priority ?? 'normal'
      const columnTasks = tasks.filter((t) => t.status === status)
      const maxPosition = columnTasks.length > 0
        ? Math.max(...columnTasks.map((t) => t.position))
        : 0
      const position = maxPosition + 1

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: fields.title,
          status,
          priority,
          position,
          description: fields.description ?? null,
          due_date: fields.due_date ?? null,
          user_id: user.id,
        })
        .select('*, task_labels(label_id, labels(*))')
        .single()

      if (error) {
        console.error('Failed to create task:', error)
        return null
      }

      if (fields.label_ids && fields.label_ids.length > 0) {
        await supabase.from('task_labels').insert(
          fields.label_ids.map((lid) => ({ task_id: data.id, label_id: lid })),
        )
      }

      await fetchTasks()
      return data as Task
    },
    [user, tasks, fetchTasks],
  )

  const updateTask = useCallback(
    async (
      taskId: string,
      updates: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'due_date' | 'status'>>,
      label_ids?: string[],
    ) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
      )

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)

      if (error) {
        console.error('Failed to update task:', error)
        await fetchTasks()
        return
      }

      if (label_ids !== undefined) {
        await supabase.from('task_labels').delete().eq('task_id', taskId)
        if (label_ids.length > 0) {
          await supabase.from('task_labels').insert(
            label_ids.map((lid) => ({ task_id: taskId, label_id: lid })),
          )
        }
        await fetchTasks()
      }
    },
    [fetchTasks],
  )

  const deleteTask = useCallback(
    async (taskId: string) => {
      const prev = tasks
      setTasks((t) => t.filter((task) => task.id !== taskId))

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        console.error('Failed to delete task:', error)
        setTasks(prev)
      }
    },
    [tasks],
  )

  const moveTask = useCallback(
    async (taskId: string, newStatus: TaskStatus, newPosition: number): Promise<boolean> => {
      const prev = tasks
      setTasks((t) =>
        t.map((task) =>
          task.id === taskId
            ? { ...task, status: newStatus, position: newPosition }
            : task,
        ),
      )

      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, position: newPosition })
        .eq('id', taskId)

      if (error) {
        console.error('Failed to move task:', error)
        setTasks(prev)
        return false
      }
      return true
    },
    [tasks],
  )

  return { tasks, loading, error, createTask, updateTask, deleteTask, moveTask }
}
