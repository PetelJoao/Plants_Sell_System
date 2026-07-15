'use client'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ChatUser } from '@/types/chat'


const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface User {
  id: string
  nome: string  
  email: string
}

interface UsersListProps {
  onSelectUser: (user: ChatUser) => void
  selectedUserId?: string
}

export function UsersList({ onSelectUser, selectedUserId }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch(`${API}/api/chat/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setUsers)
  }, [])

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-3">
          Utilizadores
        </p>
        {users.map(user => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-accent ${
              selectedUserId === user.id ? 'bg-accent' : ''
            }`}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {(user.nome || '?').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{user.nome}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}