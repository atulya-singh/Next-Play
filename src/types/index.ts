export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'

export type TaskPriority = 'low' | 'normal' | 'high'

export interface Label {
  id: string
  name: string
  color: string
  user_id: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  user_id: string
  position: number
  created_at: string
  labels: Label[]
}

export interface TaskLabel {
  task_id: string
  label_id: string
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  body: string
  created_at: string
}

export interface Column {
  id: TaskStatus
  title: string
  tasks: Task[]
}
