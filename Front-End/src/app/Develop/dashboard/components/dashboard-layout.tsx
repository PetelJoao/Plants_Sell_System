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
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Clock,Building2, ChevronLeft, ChevronRight, Home, LayoutDashboard, LogOut, ShoppingCart, User,} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Minhas Plantas",
      href: "/dashboard/Plantas",
      icon: Building2,
    },
    {
      name: "Carrinho de Compras",
      href: "/dashboard/Compras",
      icon: ShoppingCart,
    },
    {
      name: "Histórico de Compras",
      href: "/dashboard/history",
      icon: Clock,
    },
    {
      name: "Perfil",
      href: "/dashboard/perfil",
      icon: User,
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader className="group-data-[collapsible=icon]:!block">
            <SidebarToggleButton />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.name}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Logout">
                  <Button variant="ghost" className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm">
                Ajuda
              </Button>
              <Button size="sm">Novo Evento</Button>
            </div>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

function SidebarToggleButton() {
  const { toggleSidebar, state } = useSidebar()

  return (
    <button
      onClick={toggleSidebar}
      className="flex w-full items-center justify-center gap-2 p-4 hover:bg-sidebar-accent transition-colors group-data-[collapsible=icon]:px-2"
      title={state === "expanded" ? "Collapse Sidebar" : "Expand Sidebar"}
    >
      <Home className="h-6 w-6 flex-shrink-0" />
      <span className="font-semibold group-data-[collapsible=icon]:hidden">Duria</span>
      {state === "expanded" ? (
        <ChevronLeft className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
      ) : (
        <ChevronRight className="ml-auto h-4 w-4 hidden group-data-[state=collapsed]:group-data-[collapsible=icon]:block" />
      )}
    </button>
  )
}
