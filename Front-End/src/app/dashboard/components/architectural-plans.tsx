"use client"
import { useState, useEffect } from "react"
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button }  from "@/components/ui/button"
import { Badge }   from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Heart, MoreHorizontal, Share2, Trash2 } from "lucide-react"
import Image from "next/image"
import { useAuth }          from "@/Context/AuthContext"
import { useToast }         from "@/hooks/use-toast"
import { PlanUploadDialog } from "./plan-upload-dialog"
import Porshe               from "@/Assets/images/Porsche.jpeg"

type Plan = {
  id:          string
  title:       string
  description: string
  price:       number
  category:    string
  squareFeet:  number
  bedrooms:    number
  bathrooms:   number
  featured:    boolean
  image?:      string | null
}

export function ArchitecturalPlans() {
  const [filter, setFilter]               = useState<string>("All")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const { toast }                                   = useToast()
  const { user, loading, plans, carregar, deletar } = useAuth() as any

  useEffect(() => {
    async function load() {
      const data = await carregar()
      if (!data) {
        toast({
          title:       "Erro",
          description: "Não foi possível carregar as plantas.",
          variant:     "destructive",
        })
      }
    }
    load()

  }, [])

  async function handleDelete(plantId: string) {
    try {
      await deletar(plantId)
      toast({ title: "Planta removida com sucesso." })
    } catch {
      toast({ title: "Erro ao remover planta.", variant: "destructive" })
    }
  }

  const filteredPlans: Plan[] =
    filter === "All" ? plans : plans.filter((p: Plan) => p.category === filter)

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
              {["All","Residencial","Comercial","Multifamiliar","Casa Pequena","Luxo"].map(c => (
                <DropdownMenuItem key={c} onClick={() => setFilter(c)}>{c}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-sm text-muted-foreground">
            {filteredPlans.length} Plantas Disponíveis
          </span>
        </div>


        {!loading && user?.role === "arquiteto" && (
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            + Adicionar Planta
          </Button>
        )}
      </div>


      {!loading && filteredPlans.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🪴</p>
          <p>Nenhuma planta encontrada.</p>
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan: Plan) => (
          <Card key={plan.id} className="overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src={plan.image || Porshe}
                alt={plan.title}
                width={500}
                height={300}
                className="object-cover w-full h-full"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
              >
                <Heart className="h-4 w-4" />
              </Button>
              {plan.featured && (
                <Badge className="absolute top-2 left-2">Destaque</Badge>
              )}
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

                    {user?.role === "arquiteto" && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remover
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Categoria:</span> {plan.category}</div>
                <div><span className="text-muted-foreground">Tamanho:</span> {plan.squareFeet} m²</div>
                <div><span className="text-muted-foreground">Quartos:</span> {plan.bedrooms}</div>
                <div><span className="text-muted-foreground">Casas de banho:</span> {plan.bathrooms}</div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <div className="font-bold text-lg">KZ {plan.price} AOA</div>
              <Button>Comprar planta</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <PlanUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />
    </div>
  )
}