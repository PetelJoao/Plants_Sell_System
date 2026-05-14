"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, AlertCircle, CreditCard, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      description: "Registered platform users",
      icon: Users,
      color: "text-blue-600",
      href: "/admin/users",
    },
    {
      title: "Pending Withdrawals",
      value: "8",
      description: "Awaiting payment",
      icon: CreditCard,
      color: "text-yellow-600",
      href: "/admin/withdrawals",
    },
    {
      title: "Open Reports",
      value: "12",
      description: "Unreviewed complaints",
      icon: AlertCircle,
      color: "text-red-600",
      href: "/admin/reports",
    },
    {
      title: "Platform Revenue",
      value: "$47.5K",
      description: "Total withdrawals processed",
      icon: TrendingUp,
      color: "text-green-600",
      href: "/admin/withdrawals",
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Duria admin panel. Manage users, withdrawals, and reports.</p>
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
