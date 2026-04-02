import { useAuth } from '@/hooks/useAuth'
import { Board } from '@/components/Board/Board'
import { Loader2 } from 'lucide-react'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0D0D0F]">
        <Loader2 size={24} className="animate-spin text-[#7C3AED]" />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-[#0D0D0F]">
      <header className="flex items-center border-b border-[#2A2A2E] px-6 py-3">
        <h1 className="text-base font-semibold text-[#F1F1F3]">
          Kanban Board
        </h1>
      </header>
      <Board />
    </div>
  )
}

export default App
