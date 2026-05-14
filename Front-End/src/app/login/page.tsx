'use client'

import { DuriaBrandingPanelImage } from '@/components/ui/duria-branding-panel-image'
import { DuriaLoginForm } from '@/components/ui/duria-login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <DuriaBrandingPanelImage />
      <DuriaLoginForm />
    </div>
  )
}
