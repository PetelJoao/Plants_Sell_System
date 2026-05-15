'use client'

import { DuriaBrandingPanelImage } from '@/components/ui/duria-branding-panel-image'
import { DuriaRegistrationForm } from '@/components/ui/duria-registration-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <DuriaBrandingPanelImage />

      {/* Right Panel - Form */}
      <DuriaRegistrationForm />
    </div>
  )
}
