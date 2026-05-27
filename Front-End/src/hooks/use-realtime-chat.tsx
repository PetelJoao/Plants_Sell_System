import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/client'

export interface ChatMessage {
  id: string
  content: string
  user: { name: string }
  createdAt: string
}

export function useRealtimeChat(roomName: string, username: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel(roomName)
    channelRef.current = channel

    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages(prev => [...prev, payload as ChatMessage])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomName])

  const sendMessage = async (content: string) => {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      content,
      user: { name: username },
      createdAt: new Date().toISOString(),
    }
    await channelRef.current?.send({
      type: 'broadcast',
      event: 'message',
      payload: msg,
    })
    setMessages(prev => [...prev, msg])
  }

  return { messages, sendMessage }
}