import { useEffect, useRef } from 'react'
import type { ChatMessage } from './use-realtime-chat'

export function useChatScroll(messages: ChatMessage[]) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight
    }
  }, [messages])

  return ref
}