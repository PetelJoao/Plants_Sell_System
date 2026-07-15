"use client"

import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface PlanFileUploadProps {
  imageFile: File | null
  planFile: File | null
  imageError: string | null
  planError: string | null
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPlanChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearImageFile: () => void
  onClearPlanFile: () => void
}

export function PlanFileUpload({
  imageFile,
  planFile,
  imageError,
  planError,
  onImageChange,
  onPlanChange,
  onClearImageFile,
  onClearPlanFile,
}: PlanFileUploadProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Project Image
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
          {!imageFile ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm text-center">
                <label
                  htmlFor="image-upload"
                  className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
                >
                  <span>Upload an image</span>
                  <input
                    id="image-upload"
                    name="image-upload"
                    type="file"
                    className="sr-only"
                    onChange={onImageChange}
                    accept=".jpg,.jpeg,.png,.webp"
                  />
                </label>
                <p className="text-xs text-muted-foreground">JPEG, PNG or WebP up to 5MB</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-sm">
                  <p className="font-medium truncate max-w-[200px]">{imageFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClearImageFile}>
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          )}
        </div>
        {imageError && <p className="text-sm font-medium text-destructive">{imageError}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Plan File
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
          {!planFile ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm text-center">
                <label
                  htmlFor="plan-upload"
                  className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    id="plan-upload"
                    name="plan-upload"
                    type="file"
                    className="sr-only"
                    onChange={onPlanChange}
                    accept=".pdf,.jpg,.jpeg,.png,.zip"
                  />
                </label>
                <p className="text-xs text-muted-foreground">PDF, JPEG, PNG or ZIP up to 10MB</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-sm">
                  <p className="font-medium truncate max-w-[200px]">{planFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(planFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClearPlanFile}>
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          )}
        </div>
        {planError && <p className="text-sm font-medium text-destructive">{planError}</p>}
      </div>
    </>
  )
}
