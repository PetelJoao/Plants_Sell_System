"use client"

import type React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  AlertCircle,
  CreditCard,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  //const { open, toggleSidebar } = useSidebar()--Ver isso depois é o mambo q faz a side bar entrar e sair

  const navigationItems = [
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Withdrawals",
      href: "/admin/withdrawals",
      icon: CreditCard,
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: AlertCircle,
    },
  ]

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon" className="border-r border-slate-200">
          <SidebarHeader className="group-data-[collapsible=icon]:!block px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-foreground group-data-[collapsible=icon]:hidden">
                Duria Admin
              </h1>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.name}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => window.location.href = "/"}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          {/* Admin Top Bar */}
          <div className="border-b border-slate-200 bg-white h-16 flex items-center justify-between px-8">
            <h2 className="text-xl font-semibold text-foreground">Admin Dashboard</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Admin User</span>
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-sm font-medium text-slate-700">A</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
