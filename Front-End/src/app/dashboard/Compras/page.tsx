"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/app/dashboard/components/dashboard-layout"
import Image from "next/image"
import { Download, Eye, FileText, Trash2 } from "lucide-react"
import { useOrder } from "@/context/order-context"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function OrdersPage() {
  const { orders, removeFromOrder } = useOrder()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Filter orders based on search query and active tab
  const filteredOrders = orders
    .filter(
      (order) =>
        order.plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((order) => {
      if (activeTab === "all") return true
      if (activeTab === "processing") return order.status === "Processing"
      if (activeTab === "ready") return order.status === "Ready for download"
      if (activeTab === "on-hold") return order.status === "On hold"
      return true
    })

  const handleRemoveOrder = (orderId: string, planTitle: string) => {
    removeFromOrder(orderId)
    toast({
      title: "Order Removed",
      description: `${planTitle} has been removed from your orders.`,
      duration: 3000,
    })
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">View and manage your current orders.</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="ready">Ready for Download</TabsTrigger>
              <TabsTrigger value="on-hold">On Hold</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="w-full sm:w-auto">
            <Input
              placeholder="Search orders..."
              className="w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No orders found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery ? "Try a different search term" : "Add plans to your order from the dashboard"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <CardTitle className="text-lg">{order.id}</CardTitle>
                      <CardDescription>Ordered on {order.date}</CardDescription>
                    </div>
                    <Badge
                      className={
                        order.status === "Processing"
                          ? "bg-blue-500"
                          : order.status === "Ready for download"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative aspect-video w-full sm:w-48 rounded-md overflow-hidden">
                      <Image
                        src={
                          order.plan.image ||
                          `/placeholder.svg?height=300&width=500&text=${encodeURIComponent(order.plan.title) || "/placeholder.svg"}`
                        }
                        alt={order.plan.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold">{order.plan.title}</h3>
                      <p className="text-sm text-muted-foreground">Category: {order.plan.category}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>Complete plan set with all documents</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Estimated delivery:</span>
                        <span>{order.estimatedDelivery}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${order.plan.price}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4 bg-muted/50">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleRemoveOrder(order.id, order.plan.title)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                  <Button size="sm" disabled={order.status !== "Ready for download"}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Files
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
