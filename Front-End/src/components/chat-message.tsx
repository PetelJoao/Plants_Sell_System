import type { ChatMessage } from '@/hooks/use-realtime-chat'

interface Props {
  message: ChatMessage
  isOwnMessage: boolean
  showHeader: boolean
}

export const ChatMessageItem = ({ message, isOwnMessage, showHeader }: Props) => (
  <div className={`flex mt-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[75%] flex flex-col gap-1 ${isOwnMessage ? 'items-end' : ''}`}>
      {showHeader && (
        <div className={`flex items-center gap-2 text-xs px-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
          <span className="font-medium">{message.user.name}</span>
          <span className="text-muted-foreground text-xs">
            {new Date(message.createdAt).toLocaleTimeString('pt-PT', {
              hour: '2-digit', minute: '2-digit'
            })}
          </span>
        </div>
      )}
      <div className={`py-2 px-3 rounded-xl text-sm w-fit ${
        isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
      }`}>
        {message.content}
      </div>
    </div>
  </div>
)