'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/Context/AuthContext'
import DashboardLayout from '@/app/Develop/dashboard/components/dashboard-layout'
import { RealtimeChat } from '@/components/realtime-chat'
import { ArrowLeft, MessageCircle, Send, Loader2 } from 'lucide-react'
import type { ChatMessage } from '@/hooks/use-realtime-chat'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetUserId = params?.userId as string
  const nomeFromQuery = searchParams.get('nome')
  const eventoIdFromQuery = searchParams.get('evento')

  const {
    user,
    ChatObterUsuario,
    CriarConversa,
    CarregarMensagens,
    EnviarMensagemChat,
  } = useAuth() as any

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([])
  const [targetName, setTargetName] = useState(nomeFromQuery || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id || !targetUserId || !eventoIdFromQuery) return

    async function init() {
      if (!nomeFromQuery) {
        const data = await ChatObterUsuario(targetUserId)
        setTargetName(data?.nome || 'Utilizador')
      }

      const conv = await CriarConversa(targetUserId, eventoIdFromQuery)

      if (conv?.erro || !conv?.id) {
        console.error('Erro ao criar conversa:', conv)
        setLoading(false)
        return
      }

      setConversationId(conv.id)

      const msgs = await CarregarMensagens(conv.id)
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

    await EnviarMensagemChat(conversationId, latest.content)
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }


  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl flex flex-col h-[calc(100vh-64px)] bg-slate-50/50">
        
        {/* 1. CABEÇALHO DO CHAT */}
        <div className="flex items-center gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm z-10 transition-all">
          <button 
            onClick={() => router.back()} 
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 border border-blue-200 font-bold text-blue-600 shadow-inner">
                {getInitials(targetName)}
              </div>
              {/* Indicador de Status */}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" title="Online"></span>
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-base font-semibold text-slate-900 leading-tight">
                {loading ? 'A carregar informações...' : targetName || 'Utilizador'}
              </h1>
              {!loading && (
                <span className="text-xs font-medium text-emerald-600">
                  Online agora
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ÁREA PRINCIPAL */}
        <div className="flex-1 overflow-hidden bg-slate-50/50 relative">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="text-sm font-medium">A preparar ambiente seguro...</span>
            </div>
          ) : conversationId && user ? (
            <RealtimeChat
              roomName={`conv-${conversationId}`}
              username={user.nome}
              messages={initialMessages}
              onMessage={handleMessage}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Não foi possível carregar a conversa.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

// ============================================================================
// COMPONENTES DE INTERFACE PARA INJETAR NO SEU `<RealtimeChat />`
// (Copie as estruturas abaixo para o seu componente de websocket para concluir a UI)
// ============================================================================

/** 2. ESTADO VAZIO (Utilizar quando messages.length === 0) */
export function ChatEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-5 shadow-sm">
        <MessageCircle className="h-10 w-10" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Sem mensagens</h3>
      <p className="max-w-xs text-sm text-slate-500 leading-relaxed">
        Envie a primeira mensagem para iniciar a conversa. Suas mensagens são protegidas.
      </p>
    </div>
  )
}

/** 3. BOLHAS DE MENSAGEM (Renderizar na listagem de histórico) */
export function ChatBubble({ message, isOwn, time }: { message: string, isOwn: boolean, time: string }) {
  return (
    <div className={`flex w-full mb-4 px-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`relative flex flex-col max-w-[75%] md:max-w-[60%] px-4 py-2.5 shadow-sm transition-all 
        ${isOwn 
          ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
          : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message}</p>
        <span 
          className={`mt-1.5 inline-block text-[10px] font-medium 
          ${isOwn ? 'text-blue-200 self-end' : 'text-slate-400 self-start'}`}
        >
          {time}
        </span>
      </div>
    </div>
  )
}

/** 4. BARRA DE INPUT (Fixa na base do chat) */
export function ChatInputArea({ onSend, disabled }: { onSend: () => void, disabled?: boolean }) {
  return (
    <div className="border-t border-slate-200 bg-white p-4 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.03)] z-10">
      <form 
        onSubmit={(e) => { e.preventDefault(); onSend(); }} 
        className="mx-auto flex max-w-4xl items-center gap-3"
      >
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Escreva a sua mensagem..." 
            disabled={disabled}
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-60"
          />
        </div>
        <button 
          type="submit"
          disabled={disabled}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {/* Ajuste subtil da margem do ícone de envio para compensar a ótica visual */}
          <Send className="h-5 w-5 ml-0.5" /> 
        </button>
      </form>
    </div>
  )
}