'use client'
import { useState } from 'react'
import { useRealtimeChat } from '@/hooks/use-realtime-chat'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import { ChatMessageItem } from './chat-message'

interface Props {
  roomName: string
  username: string
}

export function RealtimeChat({ roomName, username }: Props) {
  const { messages, sendMessage } = useRealtimeChat(roomName, username)
  const scrollRef = useChatScroll(messages)
  const [input, setInput] = useState('')

  const handleSend = async () => {
    if (!input.trim()) return
    await sendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-80 border rounded-xl overflow-hidden bg-background">
      <div className="px-4 py-2 border-b text-sm font-semibold text-muted-foreground">
        💬 Chat da Planta
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground mt-8">
            Sem mensagens ainda. Começa a conversa!
          </p>
        )}
        {messages.map((msg, i) => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            isOwnMessage={msg.user.name === username}
            showHeader={i === 0 || messages[i - 1].user.name !== msg.user.name}
          />
        ))}
      </div>
      <div className="flex gap-2 p-2 border-t">
        <input
          className="flex-1 text-sm rounded-lg border px-3 py-1.5 bg-muted focus:outline-none"
          placeholder="Escreve uma mensagem..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}