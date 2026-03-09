'use client'

import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/dropzone'
import { useSupabaseUpload } from '@/hooks/use-supabase-upload'  

export default function Page() {

  const props = useSupabaseUpload({
    bucketName: 'PlansStoraga',  
    path: 'user-docs',  
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],  
    maxFiles: 5,  
    maxFileSize: 5 * 1024 * 1024,  
  })

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <h1>Dropzone</h1>
        
        <Dropzone {...props}>
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      </div>
    </div>
  )
}