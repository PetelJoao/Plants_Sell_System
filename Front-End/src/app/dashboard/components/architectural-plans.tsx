"use client"
import { useState } from "react"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Download, Heart, MoreHorizontal, Share2 } from "lucide-react"
import Image from "next/image"
/*
import {HousePic} from "@/Assets/images/Casa.jpeg";*/
import { useAuth } from '@/Context/AuthContext'
import Porshe from "@/Assets/images/Porsche.jpeg";

import { object } from "zod"
import { useToast } from "@/hooks/use-toast"
//import { useOrder, type Plan } from "@/context/order-context" -- ver a questão do context
import { PlanUploadDialog } from "./plan-upload-dialog"
import { set } from "date-fns"
import { error } from "console"


type Plan = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  squareFeet: number;
  bedrooms: number;
  bathrooms: number;
  featured: boolean;
  image?: string;
};


export function ArchitecturalPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const { toast } = useToast()

    const { user } = useAuth() as any;
console.log('role atual:', user?.role); 


  useEffect(()=>
  {
    async function loadPlans() 
    {
      try
      {
        const response = await fetch('http://127.0.0.1:5000/dashboard/') 
        
        if(!response.ok) throw new Error("erro na requesição!");

        const data:Plan[] = await response.json();

        setPlans(data);
      }
      catch
        {
          toast({"Tittle":"Erro","Description":"Ouve algum erro ao tentar Comunicar com a API!"})
        }
    }
    loadPlans() 


  },[])
  
  const handlePlanAdded = (newPlan: Plan) => {
    setPlans((prevPlans) => [...prevPlans, newPlan])
  }

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
        {user?.role === 'arquiteto' && (
          <Button onClick={() => setIsUploadDialogOpen(true)}>Adicionar Planta</Button>
        )}
            
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="overflow-hidden">
            <div className="relative aspect-video">

            <Image
                src={(plan.image) || Porshe}
                alt={plan.description}
                width={500} 
                height={300}
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
            <PlanUploadDialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen} onPlanAdded={handlePlanAdded} />
    </div>
  )
}

