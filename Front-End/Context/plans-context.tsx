"use client"
import React, { createContext, useContext, useState } from "react"

export interface ArchitectPlan {
  id: number
  title: string
  description: string
  price: number
  category: string
  squareFeet: number
  bedrooms: number
  bathrooms: number
  image?: string
  fileUrl?: string
  fileName?: string
  uploadedAt?: string
  featured?: boolean
}

interface PlansContextType {
  plans: ArchitectPlan[]
  addPlan: (plan: ArchitectPlan) => void
  updatePlan: (id: number, plan: Partial<ArchitectPlan>) => void
  deletePlan: (id: number) => void
}

const PlansContext = createContext<PlansContextType | undefined>(undefined)

const initialPlans: ArchitectPlan[] = [
  {
    id: 1,
    title: "Modern Minimalist Home",
    description: "A sleek, minimalist design with open floor plan and large windows.",
    price: 499,
    category: "Residential",
    squareFeet: 2400,
    bedrooms: 3,
    bathrooms: 2,
    featured: true,
  },
  {
    id: 2,
    title: "Urban Apartment Complex",
    description: "Multi-unit apartment building designed for urban environments.",
    price: 1299,
    category: "Multi-family",
    squareFeet: 12000,
    bedrooms: 12,
    bathrooms: 14,
    featured: false,
  },
  {
    id: 3,
    title: "Suburban Family House",
    description: "Traditional family home with spacious backyard and garage.",
    price: 599,
    category: "Residential",
    squareFeet: 3200,
    bedrooms: 4,
    bathrooms: 3,
    featured: true,
  },
  {
    id: 4,
    title: "Tiny House Design",
    description: "Compact and efficient tiny house with smart space utilization.",
    price: 299,
    category: "Tiny Home",
    squareFeet: 400,
    bedrooms: 1,
    bathrooms: 1,
    featured: false,
  },
  {
    id: 5,
    title: "Commercial Office Building",
    description: "Modern office building with flexible workspace layouts.",
    price: 1999,
    category: "Commercial",
    squareFeet: 25000,
    bedrooms: 0,
    bathrooms: 8,
    featured: true,
  },
  {
    id: 6,
    title: "Beachfront Villa",
    description: "Luxury beachfront property with panoramic ocean views.",
    price: 899,
    category: "Residential",
    squareFeet: 4800,
    bedrooms: 5,
    bathrooms: 4,
    featured: true,
  },
  {
    id: 7,
    title: "Mountain Cabin",
    description: "Cozy mountain retreat with stunning alpine views.",
    price: 399,
    category: "Residential",
    squareFeet: 1600,
    bedrooms: 2,
    bathrooms: 1,
    featured: false,
  },
  {
    id: 8,
    title: "Contemporary Villa",
    description: "A luxurious contemporary villa design with modern amenities.",
    price: 899,
    category: "Residential",
    squareFeet: 5500,
    bedrooms: 5,
    bathrooms: 4,
    featured: false,
  },
]

export function PlansProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<ArchitectPlan[]>(initialPlans)

  const addPlan = (newPlan: ArchitectPlan) => {
    const planWithId = {
      ...newPlan,
      id: Math.max(...plans.map((p) => p.id), 0) + 1,
    }
    setPlans([planWithId, ...plans])
  }

  const updatePlan = (id: number, updatedData: Partial<ArchitectPlan>) => {
    setPlans(plans.map((plan) => (plan.id === id ? { ...plan, ...updatedData } : plan)))
  }

  const deletePlan = (id: number) => {
    setPlans(plans.filter((plan) => plan.id !== id))
  }

  return (
    <PlansContext.Provider value={{ plans, addPlan, updatePlan, deletePlan }}>
      {children}
    </PlansContext.Provider>
  )
}

export function usePlans() {
  const context = useContext(PlansContext)
  if (context === undefined) {
    throw new Error("usePlans must be used within a PlansProvider")
  }
  return context
}
