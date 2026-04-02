import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Label } from '@/types'

export function useLabels() {
  const { user } = useAuth()
  const [labels, setLabels] = useState<Label[]>([])

  const fetchLabels = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to fetch labels:', error)
    } else {
      setLabels(data ?? [])
    }
  }, [user])

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  const createLabel = useCallback(
    async (name: string, color: string) => {
      if (!user) return null

      const { data, error } = await supabase
        .from('labels')
        .insert({ name, color, user_id: user.id })
        .select()
        .single()

      if (error) {
        console.error('Failed to create label:', error)
        return null
      }

      setLabels((prev) => [...prev, data])
      return data as Label
    },
    [user],
  )

  const deleteLabel = useCallback(
    async (labelId: string) => {
      const prev = labels
      setLabels((l) => l.filter((label) => label.id !== labelId))

      const { error } = await supabase
        .from('labels')
        .delete()
        .eq('id', labelId)

      if (error) {
        console.error('Failed to delete label:', error)
        setLabels(prev)
      }
    },
    [labels],
  )

  return { labels, createLabel, deleteLabel }
}
