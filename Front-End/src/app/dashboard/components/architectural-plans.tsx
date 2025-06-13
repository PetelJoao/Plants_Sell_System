"use client"
import { useState } from "react"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Download, Heart, MoreHorizontal, Share2 } from "lucide-react"
import Image from "next/image"
import HousePic from "@/assets/images/Casa.jpeg"
import Porshe from "@/assets/images/Porsche.jpeg"

// Dados simples das plantas que tem que ser tirados de uma API ou de um banco de dados

const plans = [
  {
    id: 1,
    title: "Casa Moderna Minimalista",
    description: "Design elegante e minimalista com planta aberta e janelas amplas.",
    price: 499,
    category: "Residencial",
    squareFeet: 240,
    bedrooms: 3,
    bathrooms: 2,
    featured: true,
},
{
    id: 2,
    title: "Complexo de Apartamentos",
    description: "Edifício de múltiplas unidades projetado para ambientes urbanos.",
    price: 1299,
    category: "Multifamiliar",
    squareFeet: 12000,
    bedrooms: 12,
    bathrooms: 14,
    featured: false,
},
{
    id: 3,
    title: "Casa Familiar Suburbana",
    description: "Residência tradicional com quintal espaçoso e garagem.",
    price: 599,
    category: "Residencial",
    squareFeet: 3200,
    bedrooms: 4,
    bathrooms: 3,
    featured: true,
    image: HousePic,
},
{
    id: 4,
    title: "Casa Pequena",
    description: "Casa compacta e eficiente com aproveitamento inteligente do espaço.",
    price: 299,
    category: "Casa Pequena",
    squareFeet: 400,
    bedrooms: 1,
    bathrooms: 1,
    featured: false,
},
{
    id: 5,
    title: "Edifício Comercial para Escritórios",
    description: "Prédio de escritórios moderno com layouts de trabalho flexíveis.",
    price: 1999,
    category: "Comercial",
    squareFeet: 25000,
    bedrooms: 0,
    bathrooms: 8,
    featured: true,
},
{
    id: 6,
    title: "Villa à Beira-Mar",
    description: "Propriedade luxuosa à beira-mar com vista panorâmica para o oceano.",
    price: 899,
    category: "Luxo",
    squareFeet: 4500,
    bedrooms: 5,
    bathrooms: 5,
    featured: false,
}
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
              <DropdownMenuItem onClick={() => setFilter("Residencial")}>Residencial</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Comercial")}>Comercial</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Multifamiliar")}>Multifamiliar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Casa Pequena")}>Casa Pequena</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Luxo")}>Luxo</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-sm text-muted-foreground">{filteredPlans.length} Plantas Disponíveis</span>
        </div>
        <Button>Carregue a sua Planta</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="overflow-hidden">
            <div className="relative aspect-video">

            <Image
                src={(plan.image) || Porshe}
                alt={plan.description}
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
                      <Share2 className="mr-2 h-4 w-4" /> Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" /> Denunciar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Categoria:</span> {plan.category}
                </div>
                <div>
                  <span className="text-muted-foreground">Tamanho:</span> {plan.squareFeet} m²
                </div>
                <div>
                  <span className="text-muted-foreground">Quartos:</span> {plan.bedrooms}
                </div>
                <div>
                  <span className="text-muted-foreground">Casas de banho:</span> {plan.bathrooms}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="font-bold text-lg">KZ {plan.price} AOA</div>
              <Button>Comprar planta</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

