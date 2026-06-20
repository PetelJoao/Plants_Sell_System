"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

export interface Report {
  id: number
  Nome_denuncia: string
  Denunciador_nome: string
  Denunciado: string
  categoria_denuncia: string
  descricao: string
  data: string
  estado: string
}

interface ReportPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planTitle: string
  planOwner: string
  reporterName?: string
}

export function ReportPlanDialog({
  open,
  onOpenChange,
  planTitle,
  planOwner,
  reporterName = "Utilizador Anónimo",
}: ReportPlanDialogProps) {
  const { toast } = useToast()
  const [reportType, setReportType] = useState<string>("")
  const [customType, setCustomType] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reportTypes = [
    "Conteúdo inapropriado",
    "Fraude",
    "Spam",
    "Outro",
  ]

  const handleSubmit = async () => {
    if (!reportType) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um tipo de denúncia.",
        variant: "destructive",
      })
      return
    }

    if (reportType === "Outro" && !customType.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, descreva o tipo de denúncia.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const report: Report = {
      id: Math.floor(Math.random() * 10000),
      Nome_denuncia: planTitle,
      Denunciador_nome: reporterName,
      Denunciado: planOwner,
      categoria_denuncia: reportType === "Outro" ? customType : reportType,
      descricao: description,
      data: new Date().toISOString().split("T")[0],
      estado: "Aberta",
    }

    try {
      console.log("Report submitted:", report)
      
      toast({
        title: "Denúncia Enviada",
        description: "Obrigado por reportar. Nossa equipa analisará em breve.",
      })

      setReportType("")
      setCustomType("")
      setDescription("")
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro ao Enviar",
        description: "Ocorreu um erro ao enviar a denúncia. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setReportType("")
    setCustomType("")
    setDescription("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Denunciar Planta</DialogTitle>
          <DialogDescription>
            Ajude-nos a manter a plataforma segura reportando conteúdo inadequado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Report Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo de Denúncia</Label>
            <RadioGroup value={reportType} onValueChange={setReportType}>
              <div className="space-y-2">
                {reportTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={type} />
                    <Label htmlFor={type} className="font-normal cursor-pointer">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {/* Custom Type Input */}
            {reportType === "Outro" && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customType" className="text-sm">
                    Descreva o tipo
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {customType.length}/30
                  </span>
                </div>
                <Input
                  id="customType"
                  placeholder="Máximo 30 caracteres"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value.slice(0, 30))}
                  maxLength={30}
                  className="h-9 border-slate-200 bg-slate-50"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição (Opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Forneça detalhes adicionais sobre a denúncia..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-slate-200 bg-slate-50 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "A Enviar..." : "Enviar Denúncia"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
