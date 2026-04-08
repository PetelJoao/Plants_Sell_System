"use client"
import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"

// Define the form schema with zod
const formSchema = z.object({
  title: z.string().min(3, { message: "O nome da planta deve ter pelo menos 3 Caracteres" }),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 Caracteres" }),
  topology: z.string().min(1, { message: "Por favor selecione uma Tipologia" }),
  category: z.string().min(1, { message: "Por favor selecione uma Categoria" }),
  squareFeet: z.coerce.number().positive({ message: "Tamanho deve ser um número positivo" }),
  bedrooms: z.coerce.number().int().nonnegative({ message: "Não pode ser um número negativo" }),
  bathrooms: z.coerce.number().positive({ message: "Não pode ser um número negativo" }),
  price: z.coerce.number().positive({ message: "Não pode ser um número negativo" }),
})

type FormValues = z.infer<typeof formSchema>

// Categories for the dropdown
const categories = [
  "Residencial",
  "Comercial",
  "Multifamiliar",
  "Tiny Home",
  "Luxo",
  "Industrial",
  "Educacional",
  "Saúde",
]

// Topology options
const topologies = [
  "Moderno",
  "Tradicional",
  "Contemporanio",
  "Minimalista",
  "Colonial",
  "Victoriana",
  "Mediterranea",
  "Craftsman",
  "Rancho",
  "Farmhouse",
]

interface PlanUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPlanAdded?: (plan: any) => void
}

export function PlanUploadDialog({ open, onOpenChange, onPlanAdded }: PlanUploadDialogProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      topology: "",
      category: "",
      squareFeet: 0,
      bedrooms: 0,
      bathrooms: 0,
      price: 0,
    },
  })

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setFileError(null)

    if (!selectedFile) {
      return
    }

    // Check file type (Aqui depois eu tenho que alterar essa logica para uploud de Pasta e não arquivos)
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "application/zip"]
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError("Invalid file type. Please upload a PDF, JPEG, PNG, or ZIP file.")
      return
    }

    // Logica para o limite dos arquivos a serem enviados(Meter isso no relatorio)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError("File is too large. Maximum size is 10MB.")
      return
    }

    setFile(selectedFile)
  }

  // Handle form submission
  const onSubmit = async(data: FormValues) => {
  
    if (!file) {
      setFileError("Por favor faça o uploud de um arquivo")
      return
    } 
    
    const formData = new FormData();
    Object.entries(data).forEach(([Key,value])=>
    {
      formData.append(Key,value.toString())
    });
    formData.append("file",file);

    try{
      const response =await fetch('http://127.0.0.1:5000/dashboard/', 
        {

          method:'POST',
          body:formData,
         
        }
      )
      if(!response.ok) throw Error("ocorreu algum erro na requesição")
    }
    catch(error)
      {
        console.log(error)
      }

        // Create a new plan object
     const newPlan = {
        id: Date.now(),
        ...data,
        featured: false,
        image: `/placeholder.svg?height=300&width=500&text=${encodeURIComponent(data.title)}`,
        // In a real app, you would upload the file to a server and get a URL
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        }



      // Call the onPlanAdded callback if provided
      if (onPlanAdded) {
        onPlanAdded(newPlan)
      }

      // Show success toast
      toast({
        title: "Plan Uploaded",
        description: "Your architectural plan has been uploaded successfully.",
        duration: 3000,
      })

      
    

    }
    
    // Reset form and close dialog
      form.reset()
      setFile(null)
      onOpenChange(false)

       // Clear file selection
      const clearFile = () => {
        setFile(null)
        setFileError(null)
      }  
   

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Faça o upload do seu projeto arquitetônico.</DialogTitle>
          <DialogDescription>
           Preencha os detalhes abaixo para enviar sua planta arquitetônica. Todos os campos são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Planta</FormLabel>
                    <FormControl>
                      <Input placeholder="Casa de família moderna" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Uma breve descrição do seu projeto arquitetônico..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="topology"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipologia</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um estilo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {topologies.map((topology) => (
                          <SelectItem key={topology} value={topology}>
                            {topology}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="squareFeet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanha (m²)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quartos</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Casas de banho</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Arquivos da Planta</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                {!file ? (
                  <>
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div className="text-sm text-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
                        >
                          <span>Upload dos Arquivos</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png,.zip"
                          />
                        </label>
                        <p className="text-xs text-muted-foreground">PDF, JPEG, PNG or ZIP up to 10MB</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={clearFile}>
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remover arquivo</span>
                    </Button>
                  </div>
                )}
              </div>
              {fileError && <p className="text-sm font-medium text-destructive">{fileError}</p>}
              <FormDescription>Faça o upload da sua planta arquitetônica.</FormDescription>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Carregar Planta</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
