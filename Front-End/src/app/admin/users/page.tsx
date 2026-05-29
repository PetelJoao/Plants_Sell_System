"use client"

import { useState, useMemo , useEffect} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Shield, Ban } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/Context/AuthContext"

interface User {
  id: number
  nome: string
  email: string
  tipo: "cliente" | "arquiteto" | "administrador"
  data_registro: string
  estado: "Activo" | "Suspenso" | "Banido"
  avatar: string
}

const initialUsers: User[] = [

]

export default function UsersPage() {
  const { toast } = useToast()
  const { CarregarUsuarios , SuspenderUser , BanUser } = useAuth() as any 
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"Todos" | "arquiteto" | "cliente" | "administrador">("Todos")
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Activo" | "Suspenso" | "Banido">("Todos")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionType, setActionType] = useState<"suspender" | "banir" | null>(null)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      const userData = await CarregarUsuarios();
      if (userData) {
        setUsers(userData);
      }
    };

    loadUsers();
  },[]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === "Todos" || user.tipo === roleFilter
      const matchesStatus = statusFilter === "Todos" || user.estado === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  const handleSuspend = (user: User) => {
    setSelectedUser(user)
    setActionType("suspender")
    setSuspendDialogOpen(true)
  }

  const handleBan = (user: User) => {
    setSelectedUser(user)
    setActionType("banir")
    setBanDialogOpen(true)
  }

  const confirmSuspend =  async () => {
    if (selectedUser) {
      try{
        await SuspenderUser(selectedUser.id)
          
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, status: "Suspenso" } : u))
        )
        toast({
          title: "Usuario Suspenso",
          description: `${selectedUser.nome}Foi Suspenso.`,
        })
        
      }
      catch(err){
        toast({
          title: "Erro",
          description: `Falha para suspender ${selectedUser.nome}.Por favor tente novamente.`,
          variant: "destructive",
        })
      }
     setSuspendDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const confirmBan = async () => {
    if (selectedUser) {
       try{
        await BanUser(selectedUser.id)
          
         setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, status: "Banido" } : u))
      )
         toast({
        title: "Usuario Banido",
        description: `${selectedUser.nome}Foi permanentemente Banido da plataforma.`,
      })
        
      }
      catch(err){
        toast({
          title: "Error",
          description: `Falha ao Banir ${selectedUser.nome}. Por favro tente Novamente.`,
          variant: "destructive",
        })
      }
     setSuspendDialogOpen(false)
      setSelectedUser(null)
    }

    }
  

  const getStatusColor = (status: User["estado"]) => {
    switch (status) {
      case "Activo":
        return "bg-green-50 text-green-700 border-green-200"
      case "Suspenso":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Banido":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuarios</h1>
        <p className="text-muted-foreground">Gerencie os usuarios da plataforma</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <Input
                placeholder="Pesquise pelo nome ou pelo email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              {(["Todos", "arquiteto", "cliente", "administrador"] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={roleFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter(filter)}
                  className={roleFilter === filter ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  {filter}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              {(["Todos", "Activo", "Suspenso", "Banido"] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={statusFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(filter)}
                  className={statusFilter === filter ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Registrado</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-slate-200">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold">
                          {user.avatar}
                        </div>
                        {user.nome}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell>{user.tipo}</TableCell>
                    <TableCell className="text-sm">{user.data_registro}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(user.estado)}>
                        {user.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.estado !== "Suspenso" && (
                            <DropdownMenuItem onClick={() => handleSuspend(user)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Suspenso
                            </DropdownMenuItem>
                          )}
                          {user.estado !== "Banido" && (
                            <DropdownMenuItem
                              onClick={() => handleBan(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Ban
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Suspend Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Suspender usuário</AlertDialogTitle>
          <AlertDialogDescription>
          Tem certeza de que deseja suspender {selectedUser?.nome}? Eles perderão temporariamente o acesso à plataforma.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSuspend} className="bg-yellow-600 hover:bg-yellow-700">
              Suspender
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Banir usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja banir permanentemente {selectedUser?.nome}? Essa ação é irreversível.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Banir Permanentemente
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
