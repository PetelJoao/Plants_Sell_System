"use client"

import { useState, useMemo } from "react"
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

interface User {
  id: number
  name: string
  email: string
  role: "Architect" | "Client"
  registeredDate: string
  status: "Active" | "Suspended" | "Banned"
  avatar: string
}

const initialUsers: User[] = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@example.com",
    role: "Architect",
    registeredDate: "2024-01-15",
    status: "Active",
    avatar: "JS",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@example.com",
    role: "Client",
    registeredDate: "2024-02-20",
    status: "Active",
    avatar: "MS",
  },
  {
    id: 3,
    name: "Carlos Costa",
    email: "carlos@example.com",
    role: "Architect",
    registeredDate: "2024-01-10",
    status: "Suspended",
    avatar: "CC",
  },
  {
    id: 4,
    name: "Ana Oliveira",
    email: "ana@example.com",
    role: "Client",
    registeredDate: "2024-03-05",
    status: "Banned",
    avatar: "AO",
  },
]

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"All" | "Architect" | "Client">("All")
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Suspended" | "Banned">("All")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionType, setActionType] = useState<"suspend" | "ban" | null>(null)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === "All" || user.role === roleFilter
      const matchesStatus = statusFilter === "All" || user.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  const handleSuspend = (user: User) => {
    setSelectedUser(user)
    setActionType("suspend")
    setSuspendDialogOpen(true)
  }

  const handleBan = (user: User) => {
    setSelectedUser(user)
    setActionType("ban")
    setBanDialogOpen(true)
  }

  const confirmSuspend = () => {
    if (selectedUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, status: "Suspended" } : u))
      )
      toast({
        title: "User Suspended",
        description: `${selectedUser.name} has been suspended.`,
      })
      setSuspendDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const confirmBan = () => {
    if (selectedUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, status: "Banned" } : u))
      )
      toast({
        title: "User Banned",
        description: `${selectedUser.name} has been permanently banned.`,
      })
      setBanDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-50 text-green-700 border-green-200"
      case "Suspended":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Banned":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        <p className="text-muted-foreground">Manage platform users and their access levels</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              {(["All", "Architect", "Client"] as const).map((filter) => (
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
              {(["All", "Active", "Suspended", "Banned"] as const).map((filter) => (
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
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Registered</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
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
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className="text-sm">{user.registeredDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(user.status)}>
                        {user.status}
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
                          {user.status !== "Suspended" && (
                            <DropdownMenuItem onClick={() => handleSuspend(user)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {user.status !== "Banned" && (
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
          <AlertDialogTitle>Suspend User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to suspend {selectedUser?.name}? They will temporarily lose access to the platform.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSuspend} className="bg-yellow-600 hover:bg-yellow-700">
              Suspend
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Ban User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently ban {selectedUser?.name}? This action is irreversible.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ban Permanently
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
