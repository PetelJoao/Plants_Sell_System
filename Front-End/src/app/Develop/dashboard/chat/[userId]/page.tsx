'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/Context/AuthContext'
import DashboardLayout from '@/app/Develop/dashboard/components/dashboard-layout'
import { RealtimeChat } from '@/components/realtime-chat'
import { ArrowLeft } from 'lucide-react'
import type { ChatMessage } from '@/hooks/use-realtime-chat'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetUserId = params?.userId as string
  const nomeFromQuery = searchParams.get('nome')
  const eventoIdFromQuery = searchParams.get('evento')  // ← confirma que existe

  const { user } = useAuth() as any

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([])
  const [targetName, setTargetName] = useState(nomeFromQuery || '')
  const [loading, setLoading] = useState(true)
useEffect(() => {
  if (!user?.id || !targetUserId || !eventoIdFromQuery) return  // espera os 3

  async function init() {
    const token = localStorage.getItem('token')

    if (!nomeFromQuery) {
      const userRes = await fetch(`${API}/api/chat/user/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (userRes.ok) {
        const data = await userRes.json()
        setTargetName(data?.nome || 'Utilizador')
      }
    }

    const convRes = await fetch(`${API}/api/chat/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        target_user_id: targetUserId,
        evento_id: eventoIdFromQuery,
      }),
    })

    const conv = await convRes.json()

    if (!convRes.ok || !conv?.id) {
      console.error('Erro ao criar conversa:', conv)
      setLoading(false)
      return
    }

    setConversationId(conv.id)

    const msgRes = await fetch(`${API}/api/chat/conversations/${conv.id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const msgs = await msgRes.json()
    setInitialMessages(
      (msgs || []).map((m: any) => ({
        id: m.id,
        content: m.content,
        user: { name: m.sender_name },
        createdAt: m.created_at,
      }))
    )
    setLoading(false)
  }

  init()
}, [user?.id, targetUserId, eventoIdFromQuery])

  const handleMessage = async (messages: ChatMessage[]) => {
    if (!conversationId || !messages?.length) return
    const latest = messages[messages.length - 1]
    if (!latest?.user || latest.user.name !== user?.nome) return

    const token = localStorage.getItem('token')
    await fetch(`${API}/api/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        content: latest.content,
      }),
    })
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="flex items-center gap-3 border-b px-6 py-4">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-semibold">
            {loading ? 'A carregar...' : `Chat com ${targetName || 'utilizador'}`}
          </h1>
        </div>

        <div className="flex-1 overflow-hidden">
          {conversationId && user ? (
            <RealtimeChat
              roomName={`conv-${conversationId}`}
              username={user.nome}
              messages={initialMessages}
              onMessage={handleMessage}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              A carregar conversa...
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}