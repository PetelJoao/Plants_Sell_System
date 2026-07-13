"use client"
import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth }         from "@/Context/AuthContext"
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
import { 
  Upload, 
  X, 
  Folder, 
  Info, 
  SlidersHorizontal, 
  Image as ImageIcon, 
  FileArchive, 
  CloudUpload,
  CheckCircle2
} from "lucide-react"

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

   const [files, setFiles] = useState<File[]>([]) // Alterado para array
   const [fileError, setFileError] = useState<string | null>(null)
  const { inserir } = useAuth() as any
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
  const selectedFiles = e.target.files ? Array.from(e.target.files) : []
  setFileError(null)

  if (selectedFiles.length === 0) return

  const allowedExtensions = [
    ".dwg", ".dxf", ".dgn", ".dwf", ".dwfx",
    ".rvt", ".rfa", ".rte",
    ".skp",
    ".3dm",
    ".ifc",
    ".nwd", ".nwc",
    ".max",
    ".blend",
    ".pdf",
    ".jpg", ".jpeg", ".png", ".tiff", ".tif", ".bmp", ".webp",
    ".zip", ".rar", ".7z",
  ]

  // Opcional: Ignorar arquivos de sistema como .DS_Store ou Thumbs.db
  const filteredFiles = selectedFiles.filter(file => file.name !== ".DS_Store" && file.name !== "Thumbs.db")

  // 1. Validar extensões dos arquivos dentro da pasta
  const invalidFiles = filteredFiles.filter(file => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase()
    return !allowedExtensions.includes(ext)
  })

  if (invalidFiles.length > 0) {
    setFileError(`A pasta contém ${invalidFiles.length} arquivo(s) com formato inválido.`)
    return
  }

  // 2. Validar tamanho total (50MB)
  const totalSize = filteredFiles.reduce((acc, file) => acc + file.size, 0)
  if (totalSize > 50 * 1024 * 1024) {
    setFileError("A pasta é muito grande. O limite total é 50MB.")
    return
  }

  // 3. Sanitizar o nome dos arquivos antes de salvar no estado
  const sanitizedFiles = filteredFiles.map(file => {
    // Separa o nome da extensão (ex: ["2. Elétrico", "dwg"])
    const parts = file.name.split(".")
    const ext = parts.pop() || ""
    const baseName = parts.join(".")

    // Limpa o nome do arquivo:
    const cleanName = baseName
      .normalize("NFD")                    // Separa os acentos das letras (ex: é vira e + ´)
      .replace(/[\u0300-\u036f]/g, "")     // Remove os acentos flutuantes
      .replace(/\s+/g, "_")                // Substitui espaços por underscores (_)
      .replace(/[^a-zA-Z0-9._-]/g, "")     // Remove qualquer caractere que não seja letra, número, ponto ou traço

    // Monta o novo nome com a extensão original de volta
    const newFileName = `${cleanName}.${ext}`

    // Como o nome é readonly, criamos um novo arquivo clonando os dados do antigo
    return new File([file], newFileName, { type: file.type })
  })

  // Salva a lista de arquivos já com os nomes limpos e seguros para o Storage!
  setFiles(sanitizedFiles)
}

// Handler para a pasta de IMAGENS
const handleImagesFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selected = e.target.files ? Array.from(e.target.files) : []
  setImageError(null)
  
  if (selected.length === 0) return

  // 1. Definição das extensões permitidas (incluindo .dwg)
  const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".dwg"]

  // Opcional: Ignorar arquivos ocultos de sistema para não travar o upload
  const filteredFiles = selected.filter(f => f.name !== ".DS_Store" && f.name !== "Thumbs.db")

  // 2. Validar as extensões dos arquivos
  const invalid = filteredFiles.filter(f => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase()
    return !allowedImageExtensions.includes(ext)
  })

  if (invalid.length > 0) {
    setImageError(`A pasta de imagens contém ${invalid.length} arquivos com formato inválido. Use apenas JPG, PNG, WebP ou DWG.`)
    return
  }

  setImageFiles(filteredFiles)
}

//new
const onSubmit = async (data: FormValues) => {
  console.log("1. onSubmit chamado", data)
  if (imageFiles.length === 0 || files.length === 0) {
    toast({ title: "Erro", description: "Selecione as duas pastas obrigatórias.", variant: "destructive" })
    return
  }

  try {
    await inserir({ ...data, imageFiles, files })

    const newPlan = {
      id: Date.now(),
      ...data,
      image:      URL.createObjectURL(imageFiles[0]),
      allImages:  imageFiles,
      allDocs:    files,
      folderName: files[0].webkitRelativePath.split('/')[0],
    }
    onPlanAdded?.(newPlan)

    toast({
      title:       "Planta Adicionada",
      description: "Planta carregada com sucesso.",
      duration:    3000,
    })

    form.reset()
    setImageFiles([])
    setFiles([])
    onOpenChange(false)

  } catch (error: any) {
    // Agora o erro do inserir é capturado corretamente
    toast({
      title:       "Erro",
      description: error.message || "Falha ao adicionar a planta.",
      variant:     "destructive",
    })
  }
}

const clearFile = () => {
  setFiles([]) // Reseta o array de arquivos
  setFileError(null) // Limpa qualquer mensagem de erro
}

const clearImageFile = () => {
  setImageFiles([])
  setImageError(null)
}

  // Estilos base reutilizáveis para inputs
  const inputStyles = "h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:bg-white transition-all shadow-sm"
  const labelStyles = "text-sm font-bold text-slate-700 mb-1.5"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0 border-slate-200 rounded-2xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full shadow-2xl">
        
        {/* Header Redesenhado */}
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-slate-100 bg-white sticky top-0 z-10">
          <DialogTitle className="text-2xl font-extrabold text-slate-900">
            Upload de Projeto Arquitetônico
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-base mt-1.5">
            Preencha os detalhes técnicos e envie os arquivos da sua planta.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-8 py-6 space-y-10 bg-slate-50/30">
            
            {/* SEÇÃO 1: Informações Básicas */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Info className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-800">Informações Básicas</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelStyles}>Nome da Planta</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Casa de família moderna" className={inputStyles} {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelStyles}>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className={inputStyles}>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category} className="font-medium focus:bg-slate-100 cursor-pointer">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500 font-medium text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelStyles}>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Forneça uma descrição detalhada do conceito e diferenciais do projeto..."
                        className="min-h-[120px] rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:bg-white resize-y transition-all shadow-sm p-4 text-slate-900"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 font-medium text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* SEÇÃO 2: Especificações Técnicas */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-800">Especificações Técnicas</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="topology"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelStyles}>Tipologia / Estilo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className={inputStyles}>
                            <SelectValue placeholder="Selecione o estilo arquitetônico" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                          {topologies.map((topology) => (
                            <SelectItem key={topology} value={topology} className="font-medium focus:bg-slate-100 cursor-pointer">
                              {topology}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500 font-medium text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="squareFeet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelStyles}>Tamanho (m²)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1" className={inputStyles} placeholder="Ex: 250" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelStyles}>Quartos</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1" className={inputStyles} placeholder="Ex: 4" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelStyles}>Casas de Banho</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1" className={inputStyles} placeholder="Ex: 3" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelStyles}>Preço ($)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                          <Input type="number" min="0" step="1" className={`${inputStyles} pl-8`} placeholder="0.00" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SEÇÃO 3: Arquivos e Mídia */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Folder className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-800">Arquivos e Mídia</h3>
              </div>

              {/* Upload: Arquivos da Planta */}
              <div className="space-y-3">
                <FormLabel className={labelStyles}>Pasta de Documentos Técnicos</FormLabel>
                <div className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 ease-in-out group flex flex-col items-center justify-center
                  ${files.length === 0 
                    ? "border-slate-300 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-400 p-10 cursor-pointer" 
                    : "border-blue-200 bg-blue-50/30 p-6"}`}>
                  
                  {files.length === 0 ? (
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                      <div className="h-16 w-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-50 transition-transform">
                        <FileArchive className="h-8 w-8 text-blue-500" />
                      </div>
                      <span className="font-bold text-slate-700 text-lg mb-1 group-hover:text-blue-700 transition-colors">
                        Selecione a Pasta do Projeto
                      </span>
                      <p className="text-sm font-medium text-slate-400 text-center max-w-xs">
                        Clique aqui para enviar a pasta contendo DWG, PDF, ZIP (Max 50MB)
                      </p>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        {...({
                          webkitdirectory: "",
                          directory: "",
                          multiple: true
                        } as any)} 
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between w-full bg-white border border-blue-100 shadow-sm rounded-xl p-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-base truncate max-w-[250px] md:max-w-[400px]">
                            {files[0].webkitRelativePath.split('/')[0]}
                          </p>
                          <p className="text-sm font-medium text-slate-500">
                            {files.length} arquivos • {(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" className="h-10 w-10 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" onClick={clearFile}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Remover pasta</span>
                      </Button>
                    </div>
                  )}
                </div>
                {fileError && <p className="text-sm font-bold text-red-500 flex items-center mt-2"><X className="w-4 h-4 mr-1"/> {fileError}</p>}
              </div>

              {/* Upload: Imagens da Planta */}
              <div className="space-y-3">
                <FormLabel className={labelStyles}>Pasta de Imagens Públicas (Galeria)</FormLabel>
                <div className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 ease-in-out group flex flex-col items-center justify-center
                  ${imageFiles.length === 0 
                    ? "border-slate-300 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-400 p-10 cursor-pointer" 
                    : "border-blue-200 bg-blue-50/30 p-6"}`}>
                  
                  {imageFiles.length === 0 ? (
                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                      <div className="h-16 w-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-50 transition-transform">
                        <ImageIcon className="h-8 w-8 text-blue-500" />
                      </div>
                      <span className="font-bold text-slate-700 text-lg mb-1 group-hover:text-blue-700 transition-colors">
                        Selecione a Pasta de Imagens
                      </span>
                      <p className="text-sm font-medium text-slate-400 text-center max-w-xs">
                        JPG, PNG, WebP para vitrine pública
                      </p>
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
                  ) : (
                    <div className="flex items-center justify-between w-full bg-white border border-blue-100 shadow-sm rounded-xl p-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-base truncate max-w-[250px] md:max-w-[400px]">
                            {imageFiles[0].webkitRelativePath.split('/')[0]}
                          </p>
                          <p className="text-sm font-medium text-slate-500">
                            {imageFiles.length} arquivos • {(imageFiles.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" className="h-10 w-10 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" onClick={clearImageFile}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Remover pasta</span>
                      </Button>
                    </div>
                  )}
                </div>
                {imageError && <p className="text-sm font-bold text-red-500 flex items-center mt-2"><X className="w-4 h-4 mr-1"/> {imageError}</p>}
              </div>
            </div>

            {/* Footer / CTA Actions */}
            <DialogFooter className="pt-6 border-t border-slate-200 mt-10">
              <div className="flex w-full gap-3 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl h-12 px-6 font-bold text-slate-600 border-slate-300 hover:bg-slate-100"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="rounded-xl h-12 px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:shadow-lg flex items-center gap-2"
                >
                  <CloudUpload className="w-5 h-5" />
                  Carregar Planta
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}