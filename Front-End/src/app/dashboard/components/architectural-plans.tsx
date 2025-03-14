"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Download, Heart, MoreHorizontal, Share2 } from "lucide-react"
import Image from "next/image"

// Sample data for architectural plans
const plans = [
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
    category: "Luxury",
    squareFeet: 4500,
    bedrooms: 5,
    bathrooms: 5,
    featured: false,
  },
]

export function ArchitecturalPlans() {
  const [filter, setFilter] = useState("All")

  const filteredPlans = filter === "All" ? plans : plans.filter((plan) => plan.category === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {filter} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter("All")}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Residential")}>Residential</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Commercial")}>Commercial</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Multi-family")}>Multi-family</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Tiny Home")}>Tiny Home</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Luxury")}>Luxury</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-sm text-muted-foreground">{filteredPlans.length} plans available</span>
        </div>
        <Button>Upload Your Plan</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src={`/placeholder.svg?height=300&width=500&text=${encodeURIComponent(plan.title)}`}
                alt={plan.title}
                fill
                className="object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              >
                <Heart className="h-4 w-4" />
              </Button>
              {plan.featured && <Badge className="absolute top-2 left-2">Featured</Badge>}
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{plan.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" /> Download Preview
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span> {plan.category}
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span> {plan.squareFeet} sq ft
                </div>
                <div>
                  <span className="text-muted-foreground">Bedrooms:</span> {plan.bedrooms}
                </div>
                <div>
                  <span className="text-muted-foreground">Bathrooms:</span> {plan.bathrooms}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="font-bold text-lg">${plan.price}</div>
              <Button>Purchase Plan</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

