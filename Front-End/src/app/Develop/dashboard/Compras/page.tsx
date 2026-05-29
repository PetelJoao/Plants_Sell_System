"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import DashboardLayout from "@/app/Develop/dashboard/components/dashboard-layout"
import Image from "next/image"
import { FileText, Trash2, ShoppingCart } from "lucide-react"
import { useOrder } from "@/Context/order-context"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function OrdersPage() {
  const { orders, removeFromOrder } = useOrder()
  const { toast } = useToast()

  const handleRemoveOrder = (orderId: string, planTitle: string) => {
    removeFromOrder(orderId)
    toast({
      title: "Order Removed",
      description: `${planTitle} has been removed from your orders.`,
      duration: 3000,
    })
  }

  const handleBuyIndividual = (planTitle: string, price: number) => {
    toast({
      title: "Purchase Initiated",
      description: `Starting purchase flow for ${planTitle} ($${price})...`,
      duration: 3000,
    })
  }

  const handleBuyAll = () => {
    const totalItems = orders.length
    const totalPrice = orders.reduce((sum, order) => sum + order.plan.price, 0)
    toast({
      title: "Purchase Initiated",
      description: `Starting purchase flow for ${totalItems} item(s) totaling $${totalPrice}...`,
      duration: 3000,
    })
  }

  const totalItems = orders.length
  const totalPrice = orders.reduce((sum, order) => sum + order.plan.price, 0)

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Carrinho</h1>
          <p className="text-muted-foreground">Veja e gerencie os itens do seu carrinho.</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Your cart is empty</h3>
            <p className="text-muted-foreground mt-1">Adicione planos no painel de controle para começar.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Todos os itens do carrinho:</h2>
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative aspect-video w-full sm:w-40 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                        {order.plan.image ? (
                          <Image
                            src={order.plan.image}
                            alt={order.plan.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <FileText className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-base">{order.plan.title}</h3>
                          <p className="text-sm text-muted-foreground">Categoria: {order.plan.category}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>Planta completo com todos os documentos</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="font-bold text-lg">${order.plan.price}</div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveOrder(order.id, order.plan.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600"
                              onClick={() => handleBuyIndividual(order.plan.title, order.plan.price)}
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Comprar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary Section */}
            <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead className="text-left font-semibold">Item</TableHead>
                        <TableHead className="text-right font-semibold">Preço</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="border-slate-100">
                          <TableCell className="text-left py-3">{order.plan.title}</TableCell>
                          <TableCell className="text-right py-3 font-medium">${order.plan.price}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 border-slate-300 bg-slate-50/50">
                        <TableCell className="py-3 font-semibold">Total ({totalItems} {totalItems === 1 ? "item" : "itens"})</TableCell>
                        <TableCell className="text-right py-3 text-lg font-bold">${totalPrice}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  size="lg"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  onClick={handleBuyAll}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Comprar Tudo
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}