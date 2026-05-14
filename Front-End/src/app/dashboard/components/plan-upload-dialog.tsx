"use client"
import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Form, FormControl, FormDescription,
  FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { useToast }  from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"
import { useAuth }   from "@/Context/AuthContext"


const formSchema = z.object({
  title:       z.string().min(3,  { message: "Mínimo 3 caracteres" }),
  description: z.string().min(10, { message: "Mínimo 10 caracteres" }),
  topology:    z.string().min(1,  { message: "Selecione uma tipologia" }),
  category:    z.string().min(1,  { message: "Selecione uma categoria" }),
  squareFeet:  z.coerce.number().positive({ message: "Deve ser positivo" }),
  bedrooms:    z.coerce.number().int().nonnegative(),
  bathrooms:   z.coerce.number().positive(),
  price:       z.coerce.number().positive({ message: "Deve ser positivo" }),
})

type FormValues = z.infer<typeof formSchema>

const categories = [
  "Residencial","Comercial","Multifamiliar",
  "Tiny Home","Luxo","Industrial","Educacional","Saúde",
]
const topologies = [
  "Moderno","Tradicional","Contemporâneo","Minimalista",
  "Colonial","Victoriana","Mediterrânea","Craftsman","Rancho","Farmhouse",
]

interface PlanUploadDialogProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
}

export function PlanUploadDialog({ open, onOpenChange }: PlanUploadDialogProps) {
  const { toast }   = useToast()
  const { inserir } = useAuth() as any

  const [file,       setFile]       = useState<File | null>(null)
  const [fileError,  setFileError]  = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver:      zodResolver(formSchema),
    defaultValues: {
      title: "", description: "", topology: "", category: "",
      squareFeet: 0, bedrooms: 0, bathrooms: 0, price: 0,
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    setFileError(null)
    if (!f) return
    const allowed = ["application/pdf","image/jpeg","image/png","application/zip"]
    if (!allowed.includes(f.type)) {
      setFileError("Tipo inválido. Use PDF, JPEG, PNG ou ZIP.")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setFileError("Ficheiro demasiado grande. Máximo 10 MB.")
      return
    }
    setFile(f)
  }

  function clearFile() { setFile(null); setFileError(null) }

  const onSubmit = async (data: FormValues) => {
    if (!file) { setFileError("Por favor faça o upload de um arquivo."); return }

    setSubmitting(true)
    try {

      await inserir({
        title:       data.title,
        description: data.description,
        squareFeet:  String(data.squareFeet),
        price:       data.price,
        file,
      })

      toast({
        title:       "Planta cadastrada!",
        description: "A planta foi enviada com sucesso.",
        duration:    3000,
      })

      form.reset()
      setFile(null)
      onOpenChange(false)

    } catch (err: any) {
      toast({
        title:       "Erro ao cadastrar",
        description: err.message ?? "Tente novamente.",
        variant:     "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload de projeto arquitetônico</DialogTitle>
          <DialogDescription>
            Preencha os detalhes e envie o ficheiro da planta.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Título + Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Planta</FormLabel>
                  <FormControl><Input placeholder="Casa de família moderna" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

  
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea placeholder="Breve descrição do projeto..." className="min-h-[100px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="topology" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipologia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topologies.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="squareFeet" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho (m²)</FormLabel>
                  <FormControl><Input type="number" min="0" step="1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

  
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="bedrooms" render={({ field }) => (
                <FormItem>
                  <FormLabel>Quartos</FormLabel>
                  <FormControl><Input type="number" min="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="bathrooms" render={({ field }) => (
                <FormItem>
                  <FormLabel>Casas de banho</FormLabel>
                  <FormControl><Input type="number" min="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (AOA)</FormLabel>
                  <FormControl><Input type="number" min="0" step="1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>


            <div className="space-y-2">
              <FormLabel>Ficheiro da Planta</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                {!file ? (
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <label htmlFor="file-upload" className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80">
                      Selecionar ficheiro
                      <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.zip" />
                    </label>
                    <p className="text-xs text-muted-foreground">PDF, JPEG, PNG ou ZIP — máx. 10 MB</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={clearFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {fileError && <p className="text-sm text-destructive">{fileError}</p>}
              <FormDescription>Faça o upload da planta arquitetônica.</FormDescription>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "A enviar..." : "Carregar Planta"}
              </Button>
            </DialogFooter>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}