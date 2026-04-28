import { useNavigate } from 'react-router-dom'

export default function ChatWidget() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/assistant')}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#d32323] text-2xl text-white shadow-xl transition hover:bg-red-700"
      aria-label="Open AI Assistant"
      title="Open AI Assistant"
    >
      💬
    </button>
  )
}