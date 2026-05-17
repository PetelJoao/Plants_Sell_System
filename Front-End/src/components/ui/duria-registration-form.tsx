'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from "next/link"
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, ChevronRight, ChevronLeft } from 'lucide-react'

type FormData = {
  profession: string
  // Personal & Professional (Step 1)
  address: string
  neighborhood: string
  municipality: string
  nif: string
  professionalLicense: string
  // Financial & Profile (Step 2)
  iban: string
  biography: string
  profilePhoto: File | null
  // Review
}

type Step = 1 | 2 | 3

const PROFESSIONS = [
  'Selecione uma profissão...',
  'Arquiteto',
  'Enginheiro',
  'Designer',
  'Gestor de Projecto',
  'Outro',
]

export function DuriaRegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    profession: '',
    address: '',
    neighborhood: '',
    municipality: '',
    nif: '',
    professionalLicense: '',
    iban: '',
    biography: '',
    profilePhoto: null,
  })

  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const isArchitect = formData.profession === 'Arquiteto'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleProfessionChange = (value: string) => {
    setFormData(prev => ({ ...prev, profession: value }))
    setCurrentStep(1)
    setErrors({})
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, profilePhoto: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1 && isArchitect) {
      if (!formData.address.trim()) newErrors.address = 'Address is required'
      if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Neighborhood is required'
      if (!formData.municipality.trim()) newErrors.municipality = 'Municipality is required'
      if (!formData.nif.trim()) newErrors.nif = 'NIF is required'
      if (!formData.professionalLicense.trim()) newErrors.professionalLicense = 'Professional License is required'
    }

    if (step === 2 && isArchitect) {
      if (!formData.iban.trim()) newErrors.iban = 'IBAN is required'
      if (!formData.biography.trim()) newErrors.biography = 'Biography is required'
      if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile photo is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep((currentStep + 1) as Step)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep(currentStep)) {
      console.log('Form submitted:', formData)
      // Here you would send the data to your backend
    }
  }

  return (
    <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-6 md:p-12 overflow-y-auto">
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Junte-se a Duria</h1>
          <p className="text-slate-600">Crie sua conta profissional</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profession Selection */}
          <div className="space-y-2">
            <Label htmlFor="profession" className="text-sm font-semibold text-slate-900">
              Professional Role
            </Label>
            <Select value={formData.profession} onValueChange={handleProfessionChange}>
              <SelectTrigger className="h-10 border-slate-200 bg-slate-50">
                <SelectValue placeholder="Select your profession" />
              </SelectTrigger>
              <SelectContent>
                {PROFESSIONS.map(prof => (
                  <SelectItem key={prof} value={prof}>
                    {prof}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Architect Wizard */}
          {isArchitect && (
            <>
              {/* Step Indicator */}
              <div className="flex items-center gap-3 py-6 mb-8">
                {[1, 2, 3].map(step => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step === currentStep
                          ? 'bg-blue-500 text-white shadow-lg'
                          : step < currentStep
                            ? 'bg-slate-300 text-slate-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-8 h-1 mx-1 rounded-full transition-all ${
                          step < currentStep ? 'bg-slate-300' : 'bg-slate-100'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Personal & Professional Info */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Informações pessoais e profissionais</h2>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="address" className="text-sm font-medium text-slate-700">
                       Endereço
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="Rua do CCB"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="h-10 border-slate-200 bg-slate-50"
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="neighborhood" className="text-sm font-medium text-slate-700">
                          Bairro
                        </Label>
                        <Input
                          id="neighborhood"
                          name="neighborhood"
                          placeholder="Futungo 2"
                          value={formData.neighborhood}
                          onChange={handleInputChange}
                          className="h-10 border-slate-200 bg-slate-50"
                        />
                        {errors.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.neighborhood}</p>}
                      </div>

                      <div>
                        <Label htmlFor="municipality" className="text-sm font-medium text-slate-700">
                          Município
                        </Label>
                        <Input
                          id="municipality"
                          name="municipality"
                          placeholder="Talatona"
                          value={formData.municipality}
                          onChange={handleInputChange}
                          className="h-10 border-slate-200 bg-slate-50"
                        />
                        {errors.municipality && <p className="text-red-500 text-xs mt-1">{errors.municipality}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="nif" className="text-sm font-medium text-slate-700">
                        NIF
                      </Label>
                      <Input
                        id="nif"
                        name="nif"
                        placeholder="123456789"
                        value={formData.nif}
                        onChange={handleInputChange}
                        className="h-10 border-slate-200 bg-slate-50"
                      />
                      {errors.nif && <p className="text-red-500 text-xs mt-1">{errors.nif}</p>}
                    </div>

                    <div>
                      <Label htmlFor="professionalLicense" className="text-sm font-medium text-slate-700">
                        Número de licença profissional
                      </Label>
                      <Input
                        id="professionalLicense"
                        name="professionalLicense"
                        placeholder="Cédula Profissional"
                        value={formData.professionalLicense}
                        onChange={handleInputChange}
                        className="h-10 border-slate-200 bg-slate-50"
                      />
                      {errors.professionalLicense && (
                        <p className="text-red-500 text-xs mt-1">{errors.professionalLicense}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Financial & Profile */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Financeiro e Perfil</h2>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="iban" className="text-sm font-medium text-slate-700">
                        IBAN
                      </Label>
                      <Input
                        id="iban"
                        name="iban"
                        placeholder="0055 0000 0000 0000 0000 0000"
                        value={formData.iban}
                        onChange={handleInputChange}
                        className="h-10 border-slate-200 bg-slate-50"
                      />
                      {errors.iban && <p className="text-red-500 text-xs mt-1">{errors.iban}</p>}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-slate-700 block mb-2">Foto do perfil</Label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                      <input
                   type="file"
                   id="photo-upload"
                   accept="image/png, image/jpeg"
                   onChange={handlePhotoChange}
                   className="hidden"
                      />
                    {photoPreview ? (
                      <div className="flex flex-col items-center justify-center">
                        <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover mb-2" />
                        <label htmlFor="photo-upload" className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
                              Alterar foto
                            </label>
                          </div>
                        ) : (
                          <label htmlFor="photo-upload" className="cursor-pointer block">
                            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600">Clique para carregar ou arraste e solte.</p>
                            <p className="text-xs text-slate-500">PNG, JPG até 5 MB</p>
                          </label>
                        )}
                      </div>
                      {errors.profilePhoto && <p className="text-red-500 text-xs mt-1">{errors.profilePhoto}</p>}
                    </div>

                    <div>
                      <Label htmlFor="biography" className="text-sm font-medium text-slate-700">
                        Biografia
                      </Label>
                      <Textarea
                        id="biography"
                        name="biography"
                        placeholder="Tell us about yourself and your professional experience"
                        value={formData.biography}
                        onChange={handleInputChange}
                        className="border-slate-200 bg-slate-50 min-h-24"
                      />
                      {errors.biography && <p className="text-red-500 text-xs mt-1">{errors.biography}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Confirm */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Review Your Information</h2>
                  </div>

                  <div className="space-y-4">
                    <Card className="border-slate-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Review Your Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Endereço:</span>
                          <span className="font-medium text-slate-900">{formData.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Bairro:</span>
                          <span className="font-medium text-slate-900">{formData.neighborhood}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Município:</span>
                          <span className="font-medium text-slate-900">{formData.municipality}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">NIF:</span>
                          <span className="font-medium text-slate-900">{formData.nif}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Licença:</span>
                          <span className="font-medium text-slate-900">{formData.professionalLicense}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Financeiro e Perfil</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs text-slate-600 mb-1">IBAN</p>
                          <p className="font-medium text-slate-900">{formData.iban}</p>
                        </div>
                        {photoPreview && (
                          <img src={photoPreview} alt="Profile" className="w-20 h-20 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Biografia</p>
                          <p className="text-sm text-slate-900 italic">{formData.biography}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-6">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 border-slate-300 text-slate-900 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                   Registro completo
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Standard Registration for Non-Architects */}
          {formData.profession && !isArchitect && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Crie sua conta</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email
                  </Label>
                  <Input id="email" type="email" placeholder="your@email.com" className="h-10 border-slate-200 bg-slate-50" />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                   Senha
                  </Label>
                  <Input id="password" type="password" placeholder="••••••••" className="h-10 border-slate-200 bg-slate-50" />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white h-10">
               Criar uma conta
              </Button>
            </div>
          )}
        </form>

        {/* Sign In Link */}
        <p className="text-center text-sm text-slate-600 mt-8">
         Já tem uma conta?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Login
        </Link>
        </p>
      </div>
    </div>
  )
}
