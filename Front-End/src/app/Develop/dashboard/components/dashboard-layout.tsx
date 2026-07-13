"use client"

import type React from "react"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Building2, ChevronLeft, ChevronRight, Home, LayoutDashboard, LogOut, ShoppingCart, User, ActivitySquareIcon} from "lucide-react"
import Link from "next/link"
import { usePathname , useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from '@/Context/AuthContext'
import { useState } from 'react'
import { ChatModal } from '@/components/ChatModal'
import { MessageCircle } from 'lucide-react'
import { motion, LayoutGroup } from "framer-motion"
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading, logout } = useAuth() as any;
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    if (loading) return; 
    if (!user) router.push('/login');
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  const handleevento = () => {
    router.push('/Develop/dashboard/Eventos');
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F1] font-[Inter,sans-serif]">
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap");
        `}</style>
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#C79A56] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-[#55617A]">Carregando...</p>
        </div>
      </div>
    )
  }

  const isArquitecto = user?.role === "arquiteto"

  const navigationItems = [
    { name: "Dashboard",            href: "/Develop/dashboard",                  icon: LayoutDashboard, show: true },
    { name: "Minhas Plantas",       href: "/Develop/dashboard/Plantas",          icon: Building2,       show: isArquitecto },
    { name: "Meus eventos",               href: "/Develop/dashboard/Eventos",           icon: ActivitySquareIcon,            show: true },
    { name: "Eventos",         href: "/Develop/dashboard/Eventos/Arquitecto", icon: Calendar,       show: isArquitecto },
    { name: "Carrinho de Compras",  href: "/Develop/dashboard/Compras",          icon: ShoppingCart,    show: true },
    { name: "Histórico de Compras", href: "/Develop/dashboard/history",          icon: Clock,           show: true },
    { name: "Perfil",               href: "/Develop/dashboard/perfil",           icon: User,            show: true },
    
  ].filter(item => item.show)



// Dentro do componente:


// Botão na navbar ou onde preferires:

  return (
    <SidebarProvider>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap");
        .font-display { font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif; }
        .font-mono-label { font-family: "IBM Plex Mono", ui-monospace, monospace; letter-spacing: 0.06em; }
      `}</style>
    
      <div className="flex min-h-screen w-full font-[Inter,sans-serif] bg-[#F7F5F1]">
        <Sidebar
          collapsible="icon"
          variant="floating"
          className="border-none [&_[data-sidebar=sidebar]]:bg-gradient-to-b [&_[data-sidebar=sidebar]]:from-[#101A2E] [&_[data-sidebar=sidebar]]:via-[#132038] [&_[data-sidebar=sidebar]]:to-[#0B1424]"
          style={
            {
              "--sidebar-background": "#101A2E",
              "--sidebar-foreground": "#ffffff",
              "--sidebar-primary": "#C79A56",
              "--sidebar-primary-foreground": "#101A2E",
              "--sidebar-accent": "rgba(255,255,255,0.10)",
              "--sidebar-accent-foreground": "#ffffff",
              "--sidebar-border": "rgba(255,255,255,0.08)",
              "--sidebar-ring": "#C79A56",
            } as React.CSSProperties
          }
        >
          <SidebarHeader className="border-b border-white/10 bg-transparent px-2 pt-3 pb-2">
            <SidebarToggleButton />
          </SidebarHeader>
          <SidebarContent className="px-2 py-3 bg-transparent">
            <LayoutGroup id="sidebar-nav">

            <SidebarMenu className="gap-3">
              <div className="px-0 pb-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setChatOpen(true)}
                  className="h-10 w-full justify-start gap-3 rounded-full px-3 text-white/80 hover:bg-white/10 hover:text-white group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Mensagens</span>
                </Button>
              </div>

              <ChatModal
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                currentUser={{ id: user.id, nome: user.nome, email: user.email }}
              />
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.name} className="relative">
                   {isActive && (
                        <>
                          {/* Pill com borda invertida — só no modo expandido */}
                          <motion.span
                            layoutId="sidebar-active-pill"
                            className="absolute -right-5 left-0 top-0 bottom-0 z-0 rounded-l-full bg-[#F7F5F1] group-data-[collapsible=icon]:hidden"
                            transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.9 }}
                          >
                            {/* Curva Superior */}
                            <svg 
                              className="pointer-events-none absolute -top-8 right-3 h-8 w-8 text-[#F7F5F1]" 
                              viewBox="0 0 24 24" 
                              fill="currentColor"
                            >
                              <path d="M0 24h24V0C24 13.2548 13.2548 24 0 24Z" />
                            </svg>
                            
                            {/* Curva Inferior */}
                            <svg 
                              className="pointer-events-none absolute -bottom-8 right-3 h-8 w-8 text-[#F7F5F1]" 
                              viewBox="0 0 24 24" 
                              fill="currentColor"
                            >
                              <path d="M0 0h24v24C24 10.7452 13.2548 0 0 0Z" />
                            </svg>
                          </motion.span>

                          {/* Pill simples — só no modo ícone colapsado, sem bleed */}
                          <motion.span
                            layoutId="sidebar-active-pill-icon"
                            className="absolute inset-0 z-0 hidden rounded-full bg-[#F7F5F1] group-data-[collapsible=icon]:block"
                            transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.9 }}
                          />
                        </>
                      )}
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className="relative z-10 rounded-full bg-transparent px-3 py-2.5 text-sm font-medium text-white/80 transition-colors duration-200 hover:text-white data-[active=true]:font-semibold data-[active=true]:text-[#101A2E]"
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {item.name}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </LayoutGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-white/10 px-2 py-3 bg-transparent">
            <div className="mb-2 flex items-center gap-2 rounded-full px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F5F1] font-display text-sm font-semibold text-[#101A2E]">
                {(user?.nome || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-medium text-white">{user?.nome || "Utilizador"}</p>
                <p className="truncate text-xs text-white/60">{user?.email}</p>
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Logout" className="rounded-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-full text-white/80 hover:bg-white/10 hover:text-white group-data-[collapsible=icon]:justify-center"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                    <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="flex h-14 items-center border-b border-[#E4E0D8] bg-white/80 backdrop-blur-md px-4 lg:h-[64px] lg:px-6">
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-[#F7F5F1] text-[#101A2E] hover:bg-[#F7F5F1] hover:border-[#C79A56]/50"
              >
                Ajuda
              </Button>
              <Button
                size="sm"
                onClick={() => router.push('/Develop/dashboard/Eventos')}
                className="rounded-full bg-[#F7F5F1] text-white hover:bg-[#F7F5F1] shadow-sm shadow-[#101A2E]/15"
              >
                Novo Evento
              </Button>
            </div>
          </div>
          <div className="bg-[#F7F5F1] min-h-[calc(100vh-56px)] lg:min-h-[calc(100vh-64px)] p-4 lg:p-6">
            {children}
          </div>
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
      className="flex w-full items-center gap-2 rounded-full px-1 py-1 text-white transition-colors hover:bg-white/10 group-data-[collapsible=icon]:justify-center"
      title={state === "expanded" ? "Collapse Sidebar" : "Expand Sidebar"}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C79A56] text-[#101A2E] shadow-md">
        <Home className="h-5 w-5" />
      </span>
      <span className="font-display font-semibold text-white group-data-[collapsible=icon]:hidden">Duria</span>
      <span className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 group-data-[collapsible=icon]:hidden">
        {state === "expanded" ? (
          <ChevronLeft className="h-4 w-4 text-white" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white" />
        )}
      </span>
    </button>
  )
}