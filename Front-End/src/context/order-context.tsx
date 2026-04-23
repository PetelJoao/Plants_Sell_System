"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type Plan = {
  id: number
  title: string
  description: string
  price: number
  category: string
  squareFeet: number
  bedrooms: number
  bathrooms: number
  featured: boolean
  image?: string
}

export type OrderItem = {
  id: string
  planId: number
  plan: Plan
  date: string
  status: "Processing" | "Ready for download" | "On hold"
  estimatedDelivery: string
}

type OrderContextType = {
  orders: OrderItem[]
  addToOrder: (plan: Plan) => void
  removeFromOrder: (orderId: string) => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: React.ReactNode }) {
  // Initialize orders from localStorage if available
  const [orders, setOrders] = useState<OrderItem[]>([])

  // Load orders from localStorage on initial render
  useEffect(() => {
    const savedOrders = localStorage.getItem("archplans-orders")
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders))
      } catch (error) {
        console.error("Failed to parse saved orders:", error)
      }
    }
  }, [])

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("archplans-orders", JSON.stringify(orders))
  }, [orders])

  const addToOrder = (plan: Plan) => {
    const newOrder: OrderItem = {
      id: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      planId: plan.id,
      plan,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      status: "Processing",
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }

    setOrders((prevOrders) => [...prevOrders, newOrder])
  }

  const removeFromOrder = (orderId: string) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId))
  }

  return <OrderContext.Provider value={{ orders, addToOrder, removeFromOrder }}>{children}</OrderContext.Provider>
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider")
  }
  return context
}
