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
import { Upload, X, Folder } from "lucide-react"

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
  // Estado para a pasta de imagens (Galeria/Capa)
   const [imageFiles, setImageFiles] = useState<File[]>([])
   const [imageError, setImageError] = useState<string | null>(null)

   // Estado para a pasta do projeto (Documentação técnica)
   const [files, setFiles] = useState<File[]>([]) // Alterado para array
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

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFiles = e.target.files ? Array.from(e.target.files) : []
  setFileError(null)

  if (selectedFiles.length === 0) return

  // Extensões permitidas para plantas arquitetónicas
  const allowedExtensions = [
    // CAD / Modelação 3D
    ".dwg", ".dxf", ".dgn", ".dwf", ".dwfx",
    ".rvt", ".rfa", ".rte",   // Revit
    ".skp",                    // SketchUp
    ".3dm",                    // Rhino
    ".ifc",                    // BIM
    ".nwd", ".nwc",            // Navisworks
    ".max",                    // 3ds Max
    ".blend",                  // Blender
    // Documentos e imagens
    ".pdf",
    ".jpg", ".jpeg", ".png", ".tiff", ".tif", ".bmp", ".webp",
    // Compactados
    ".zip", ".rar", ".7z",
  ]

  // Ficheiros de sistema a ignorar
  const systemFiles = [".DS_Store", "Thumbs.db", "desktop.ini"]

  // Filtrar ficheiros de sistema
  const filteredFiles = selectedFiles.filter(
    file => !systemFiles.includes(file.name)
  )

  // Validar extensões
  const invalidFiles = filteredFiles.filter(file => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase()
    return !allowedExtensions.includes(ext)
  })

  if (invalidFiles.length > 0) {
    const invalidNames = invalidFiles.map(f => f.name).join(", ")
    setFileError(`Formato não suportado: ${invalidNames}. Formatos aceites: DWG, DXF, RVT, SKP, IFC, PDF, entre outros.`)
    return
  }

  // Validar tamanho total (100MB para plantas complexas)
  const totalSize = filteredFiles.reduce((acc, file) => acc + file.size, 0)
  if (totalSize > 100 * 1024 * 1024) {
    setFileError("Os ficheiros são muito grandes. O limite total é 100MB.")
    return
  }

  setFiles(filteredFiles)
}

// Handler para a pasta de IMAGENS
const handleImagesFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selected = e.target.files ? Array.from(e.target.files) : []
  setImageError(null)
  
  if (selected.length === 0) return

  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"]
  const invalid = selected.filter(f => !allowedImageTypes.includes(f.type))

  if (invalid.length > 0) {
    setImageError(`A pasta de imagens contém ${invalid.length} arquivos com formato inválido. Use apenas JPG, PNG ou WebP.`)
    return
  }
  setImageFiles(selected)
}


//new
const onSubmit = (data: FormValues) => {
  if (imageFiles.length === 0 || files.length === 0) {
    toast({ title: "Erro", description: "Selecione as duas pastas obrigatórias.", variant: "destructive" })
    return
  }
  const newPlan = {
    id: Date.now(),
    ...data,
    // Definimos a primeira imagem da pasta como a capa para exibição imediata
    image: URL.createObjectURL(imageFiles[0]), 
    allImages: imageFiles, // Array completo para a galeria
    allDocs: files,    // Array completo dos documentos técnicos
    folderName: files[0].webkitRelativePath.split('/')[0]
  }
  onPlanAdded?.(newPlan)

    toast({
      title: "Planta Adicionada",
      description: "Your architectural plan has been uploaded successfully.",
      duration: 3000,
    })
  // Limpeza
  form.reset()
  setImageFiles([])
  setFiles([])
  onOpenChange(false)
}
const clearFile = () => {
  setFiles([]) // Reseta o array de arquivos
  setFileError(null) // Limpa qualquer mensagem de erro
  }
  const clearImageFile = () => {
    setImageFiles([])
    setImageError(null)
  }
  /* // Handle form submission
const onSubmit = (data: FormValues) => {
  if (files.length === 0) {
    setFileError("Por favor, selecione uma pasta para upload")
    return
  }

  const newPlan = {
    id: Date.now(),
    ...data,
    featured: false,
    image: `/placeholder.svg?height=300&width=500&text=${encodeURIComponent(data.title)}`,
    // Guardamos a lista de arquivos e o nome da pasta (que vem no webkitRelativePath)
    folderName: files[0].webkitRelativePath.split('/')[0], 
    filesCount: files.length,
    files: files // Array com todos os objetos de arquivo
  }

  if (onPlanAdded) {
    onPlanAdded(newPlan)
  }

  toast({
    title: "Pasta Carregada",
    description: `${files.length} arquivos da pasta foram preparados com sucesso.`,
    duration: 3000,
  })

  form.reset()
  setFiles([])
  onOpenChange(false)
}

 // Clear file selection
const clearFile = () => {
  setFiles([]) // Reseta o array de arquivos
  setFileError(null) // Limpa qualquer mensagem de erro
  }
*/
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
  <FormLabel>Arquivos da Planta (Pasta)</FormLabel>
  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
    {/* 1. Mudamos a verificação para o tamanho do array de arquivos */}
    {files.length === 0 ? (
      <>
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm text-center">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
            >
              <span>Selecionar Pasta do Projeto</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".dwg,.dxf,.dgn,.dwf,.dwfx,.rvt,.rfa,.rte,.skp,.3dm,.ifc,.nwd,.nwc,.max,.blend,.pdf,.jpg,.jpeg,.png,.tiff,.tif,.bmp,.webp,.zip,.rar,.7z"
                onChange={handleFileChange}
                {...({
                  webkitdirectory: "",
                  directory: "",
                  multiple: true
                } as any)} 
              />
            </label>
            <p className="text-xs text-muted-foreground">DWG, DXF, RVT, SKP, IFC, PDF, imagens e ZIP até 50MB</p>
          </div>
        </div>
      </>
    ) : (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            {/* Ícone de pasta para dar um feedback visual melhor */}
            <Folder className="h-5 w-5 text-primary" /> 
          </div>
          <div className="text-sm">
            {/* 2. Exibimos o nome da pasta (pegando o caminho do primeiro arquivo) */}
            <p className="font-medium truncate max-w-[200px]">
              {files[0].webkitRelativePath.split('/')[0]}
            </p>
            {/* 3. Exibimos a quantidade de arquivos e o tamanho total */}
            <p className="text-xs text-muted-foreground">
              {files.length} arquivos ({ (files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2) } MB)
            </p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={clearFile}>
          <X className="h-4 w-4" />
          <span className="sr-only">Remover pasta</span>
        </Button>
      </div>
    )}
  </div>
  {fileError && <p className="text-sm font-medium text-destructive">{fileError}</p>}
  <FormDescription>Selecione a pasta raiz com os ficheiros da planta. Formatos suportados: DWG, DXF, RVT, SKP, IFC, PDF, entre outros.</FormDescription>
           </div>
 
 <div className="space-y-2">
  <FormLabel>Imagens Públicas da Planta (Pasta)</FormLabel>
  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
    {/* 1. Mudamos a verificação para o tamanho do array de arquivos */}
    {imageFiles.length === 0 ? (
      <>
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm text-center">
            <label
              htmlFor="image-upload"
              className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
            >
              <span>Selecionar Pasta das Imagens públicas do Projeto</span>
              <input
                id="image-upload"
                 name="image-upload"
                type="file"
                className="sr-only"
                onChange={handleImagesFolderChange}
                {...({
                  webkitdirectory: "",
                  directory: "",
                  multiple: true
                } as any)} 
              />
            </label>
            <p className="text-xs text-muted-foreground">Selecione a pasta contendo PDF, JPEG, PNG ou ZIP</p>
          </div>
        </div>
      </>
    ) : (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            {/* Ícone de pasta para dar um feedback visual melhor */}
            <Folder className="h-5 w-5 text-primary" /> 
          </div>
          <div className="text-sm">
            {/* 2. Exibimos o nome da pasta (pegando o caminho do primeiro arquivo) */}
            <p className="font-medium truncate max-w-[200px]">
              {imageFiles[0].webkitRelativePath.split('/')[0]}
            </p>
            {/* 3. Exibimos a quantidade de arquivos e o tamanho total */}
            <p className="text-xs text-muted-foreground">
              {imageFiles.length} arquivos ({ (imageFiles.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2) } MB)
            </p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={clearImageFile}>
          <X className="h-4 w-4" />
          <span className="sr-only">Remover pasta</span>
        </Button>
      </div>
    )}
  </div>
  {imageError && <p className="text-sm font-medium text-destructive">{imageError}</p>}
  <FormDescription>Selecione a pasta raiz que contém todas as imagens da planta.</FormDescription>
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
