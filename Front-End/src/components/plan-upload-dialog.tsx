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
import { useToast } from "@/components/ui/use-toast"
import { PlanFileUpload } from "./plan-file-upload"

// Define the form schema with zod
const formSchema = z.object({
  title: z.string().min(3, { message: "Plan name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  topology: z.string().min(1, { message: "Please select a topology" }),
  category: z.string().min(1, { message: "Please select a category" }),
  squareFeet: z.coerce.number().positive({ message: "Size must be a positive number" }),
  bedrooms: z.coerce.number().int().nonnegative({ message: "Bedrooms must be a non-negative integer" }),
  bathrooms: z.coerce.number().positive({ message: "Bathrooms must be a positive number" }),
  price: z.coerce.number().positive({ message: "Price must be a positive number" }),
})

type FormValues = z.infer<typeof formSchema>

// Categories for the dropdown
const categories = [
  "Residential",
  "Commercial",
  "Multi-family",
  "Tiny Home",
  "Luxury",
  "Industrial",
  "Educational",
  "Healthcare",
]

// Topology options
const topologies = [
  "Modern",
  "Traditional",
  "Contemporary",
  "Minimalist",
  "Colonial",
  "Victorian",
  "Mediterranean",
  "Craftsman",
  "Ranch",
  "Farmhouse",
]

interface PlanUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPlanAdded?: (plan: any) => void
}

export function PlanUploadDialog({ open, onOpenChange, onPlanAdded }: PlanUploadDialogProps) {
  const { toast } = useToast()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [planFile, setPlanFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [planError, setPlanError] = useState<string | null>(null)

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

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setImageError(null)

    if (!selectedFile) {
      return
    }

    // Check file type (image only)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(selectedFile.type)) {
      setImageError("Invalid file type. Please upload a JPEG, PNG, or WebP image.")
      return
    }

    // Check file size (5MB limit for images)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setImageError("File is too large. Maximum size is 5MB.")
      return
    }

    setImageFile(selectedFile)
  }

  // Handle plan file selection
  const handlePlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setPlanError(null)

    if (!selectedFile) {
      return
    }

    // Check file type (you can adjust allowed types)
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "application/zip"]
    if (!allowedTypes.includes(selectedFile.type)) {
      setPlanError("Invalid file type. Please upload a PDF, JPEG, PNG, or ZIP file.")
      return
    }

    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setPlanError("File is too large. Maximum size is 10MB.")
      return
    }

    setPlanFile(selectedFile)
  }

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    if (!imageFile) {
      setImageError("Please upload an image file")
      return
    }

    if (!planFile) {
      setPlanError("Please upload a plan file")
      return
    }

    // Create a new plan object
    const newPlan = {
      id: Date.now(),
      ...data,
      featured: false,
      image: URL.createObjectURL(imageFile),
      // In a real app, you would upload the file to a server and get a URL
      fileUrl: URL.createObjectURL(planFile),
      fileName: planFile.name,
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

    // Reset form and close dialog
    form.reset()
    setImageFile(null)
    setPlanFile(null)
    onOpenChange(false)
  }

  // Clear image file selection
  const clearImageFile = () => {
    setImageFile(null)
    setImageError(null)
  }

  // Clear plan file selection
  const clearPlanFile = () => {
    setPlanFile(null)
    setPlanError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Your Architectural Plan</DialogTitle>
          <DialogDescription>
            Fill in the details below to upload your architectural plan. All fields are required.
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
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Modern Family Home" {...field} />
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
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of your architectural plan..."
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
                    <FormLabel>Topology</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a style" />
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
                    <FormLabel>Size (sq ft)</FormLabel>
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
                    <FormLabel>Bedrooms</FormLabel>
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
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.5" {...field} />
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
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <PlanFileUpload
              imageFile={imageFile}
              planFile={planFile}
              imageError={imageError}
              planError={planError}
              onImageChange={handleImageChange}
              onPlanChange={handlePlanChange}
              onClearImageFile={clearImageFile}
              onClearPlanFile={clearPlanFile}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Upload Plan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
