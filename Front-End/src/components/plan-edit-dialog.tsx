"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/Context/AuthContext"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { PlanFileUpload } from "./plan-file-upload"

interface ArchitectPlan {
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
}

interface PlanEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: ArchitectPlan
  onSave: (plan: ArchitectPlan) => void
}

export function PlanEditDialog({ open, onOpenChange, plan, onSave }: PlanEditDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState(plan)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [planFile, setPlanFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [planError, setPlanError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { EditPlant } = useAuth() as any

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "squareFeet" || name === "bedrooms" || name === "bathrooms"
        ? parseInt(value) || 0
        : value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setImageError(null)

    if (!selectedFile) {
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(selectedFile.type)) {
      setImageError("Invalid file type. Please upload a JPEG, PNG, or WebP image.")
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setImageError("File is too large. Maximum size is 5MB.")
      return
    }

    setImageFile(selectedFile)
  }

  const handlePlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setPlanError(null)

    if (!selectedFile) {
      return
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "application/zip"]
    if (!allowedTypes.includes(selectedFile.type)) {
      setPlanError("Invalid file type. Please upload a PDF, JPEG, PNG, or ZIP file.")
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setPlanError("File is too large. Maximum size is 10MB.")
      return
    }

    setPlanFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      
      await EditPlant(plan.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        squareFeet: formData.squareFeet,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        price: formData.price,
        files: planFile ? [planFile] : [],
        imageFiles: imageFile ? [imageFile] : [],
      })

      toast({
        title: "Sucesso",
        description: "Planta atualizada com sucesso.",
      })

      onSave(formData)
      setImageFile(null)
      setPlanFile(null)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar a planta.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Floor Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Plan Name *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter plan name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={handleSelectChange}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Multi-family">Multi-family</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your floor plan"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="squareFeet">Size (sq ft)</Label>
              <Input
                id="squareFeet"
                name="squareFeet"
                type="number"
                value={formData.squareFeet}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          <PlanFileUpload
            imageFile={imageFile}
            planFile={planFile}
            imageError={imageError}
            planError={planError}
            onImageChange={handleImageChange}
            onPlanChange={handlePlanChange}
            onClearImageFile={() => {
              setImageFile(null)
              setImageError(null)
            }}
            onClearPlanFile={() => {
              setPlanFile(null)
              setPlanError(null)
            }}
          />

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}