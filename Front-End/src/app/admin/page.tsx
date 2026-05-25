"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, AlertCircle, CreditCard, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/Context/AuthContext"
import {useEffect, useState} from "react"
export default function AdminDashboard() {
  
const { LoadAdmingeral } = useAuth() as any 
const [stats, setStats] = useState([
  {
    title: "Total de Usuarios da Plataforma",
    value: "0",
    description: "Usuarios registados na Plataforma",
    icon: Users,
    color: "text-blue-600",
    href: "/admin/users",
  },
  {
    title: "Saques pendentes",
    value: "0",
    description: "Aguardando pagamento",
    icon: CreditCard,
    color: "text-yellow-600",
    href: "/admin/withdrawals",
  },
  {
    title: "Abrir relatórios",
    value: "0",
    description: "Reclamações não analisadas",
    icon: AlertCircle,
    color: "text-red-600",
    href: "/admin/reports",
  },
  {
    title: "Receita da plataforma",
    value: "$0",
    description: "Lucro da Plataforma",
    icon: TrendingUp,
    color: "text-green-600",
    href: "/admin/withdrawals",
  },
])

useEffect(() => {
  const loadData = async () => {
    try {
      const data = await LoadAdmingeral();
      console.log("DATA ADMIN:", data);
      setStats([
        {
          title: "Total de Usuarios da Plataforma",
          value: data.total_usuarios?.toLocaleString() ?? "0",
          description: "Usuarios registados na Plataforma",
          icon: Users,
          color: "text-blue-600",
          href: "/admin/users",
        },
        {
          title: "Saques pendentes",
          value: String(data.saques_pendentes ?? 0),
          description: "Aguardando pagamento",
          icon: CreditCard,
          color: "text-yellow-600",
          href: "/admin/withdrawals",
        },
        {
          title: "Abrir relatórios",
          value: String(data.denuncias_pendentes ?? 0),
          description: "Reclamações não analisadas",
          icon: AlertCircle,
          color: "text-red-600",
          href: "/admin/reports",
        },
        {
          title: "Receita da plataforma",
          value: `$${(data.receita_plataforma / 1000).toFixed(1)}K`,
          description: "Lucro da Plataforma",
          icon: TrendingUp,
          color: "text-green-600",
          href: "/admin/withdrawals",
        },
      ])
    } catch (error) {
      console.error("Erro ao carregar dados do admin:", error);
    }
  }

  loadData()
}, [])

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel de administração</h1>
        <p className="text-muted-foreground">Bem-vindo ao painel de administração da Duria. Gerencie usuários, saques e relatórios.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-slate-50 to-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common admin tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Link href="/admin/users">
              <p className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                Manage Users →
              </p>
            </Link>
            <Link href="/admin/withdrawals">
              <p className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                Process Withdrawals →
              </p>
            </Link>
            <Link href="/admin/reports">
              <p className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                Review Reports →
              </p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
