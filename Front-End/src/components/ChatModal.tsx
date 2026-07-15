'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RealtimeChat } from '@/components/realtime-chat'
import { UsersList } from '@/components/UsersList'
import { useEffect } from 'react'
import type { ChatMessage } from '@/hooks/use-realtime-chat'
import type { ChatUser } from '@/types/chat'


const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface ChatModalProps {
  open: boolean
  onClose: () => void
  currentUser: ChatUser
}

export function ChatModal({ open, onClose, currentUser }: ChatModalProps) {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([])

  // Ao seleccionar utilizador: cria/busca conversa e carrega histórico
  const handleSelectUser = async (user: ChatUser) => {
    setSelectedUser(user)
    const token = localStorage.getItem('token')

    // Criar ou retomar conversa
    const convRes = await fetch(`${API}/api/chat/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ target_user_id: user.id }),
    })
    const conv = await convRes.json()
    setConversationId(conv.id)

    // Carregar histórico
    const msgRes = await fetch(`${API}/api/chat/conversations/${conv.id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const msgs = await msgRes.json()
    setInitialMessages(
      msgs.map((m: any) => ({
        id: m.id,
        content: m.content,
        user: { name: m.sender_name },
        createdAt: m.created_at,
      }))
    )
  }

  // Guardar mensagem nova no FastAPI
 const handleMessage = async (messages: ChatMessage[]) => {
  if (!conversationId) return
  if (!messages || messages.length === 0) return  // guarda contra array vazio
  
  const latest = messages[messages.length - 1]
  if (!latest || !latest.user) return  // guarda contra undefined
  
  // Só persiste mensagens do próprio utilizador
  if (latest.user.name !== currentUser.nome) return

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

  // Limpar ao fechar
  const handleClose = () => {
    setSelectedUser(null)
    setConversationId(null)
    setInitialMessages([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[600px] p-0 flex flex-col">
        <DialogHeader className="px-4 pt-4 pb-2 border-b">
          <DialogTitle>
            {selectedUser ? `Chat com ${selectedUser.nome}` : 'Iniciar Conversa'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Lista de utilizadores à esquerda */}
          <div className="w-56 border-r shrink-0">
            <UsersList
              onSelectUser={handleSelectUser}
              selectedUserId={selectedUser?.id}
            />
          </div>

          {/* Área de chat à direita */}
          <div className="flex-1 overflow-hidden">
            {conversationId ? (
              <RealtimeChat
                roomName={`conv-${conversationId}`}
                username={currentUser.nome}
                messages={initialMessages}
                onMessage={handleMessage}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Selecciona um utilizador para iniciar a conversa
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}