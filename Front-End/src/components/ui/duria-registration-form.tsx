'use client'

import { useAuth } from '@/Context/AuthContext'
import { useState } from 'react'
import Link from 'next/link'
import { useForm, Controller, FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, ChevronRight, ChevronLeft } from 'lucide-react'

const PROFESSIONS = ['Arquiteto', 'Cliente'] as const
const GENDERS = ['M', 'F'] as const

// Architect ✅ FIX 1: Removidos neighborhood, municipality, professionalLicense do schema
const baseArchitectSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'O nome é obrigatório')
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ]+([\s'\-][A-Za-zÀ-ÖØ-öø-ÿ]+)+$/, 'Insira o seu nome completo (nome e sobrenome)'),
  email: z.string().min(1, 'O e-mail é obrigatório').email('Formato de e-mail inválido'),
  phoneNumber: z
    .string()
    .min(1, 'O número de telefone é obrigatório')
    .regex(/^\d{9}$/, 'O número de telefone deve conter exatamente 9 dígitos numéricos'),
  password: z.string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/\d/, 'A senha deve conter pelo menos um número'),
  gender: z.enum(GENDERS, { errorMap: () => ({ message: 'O gênero é obrigatório' }) }),
  address: z.string().min(1, 'O endereço é obrigatório'),
  nif: z.string().min(1, 'O NIF é obrigatório'),
  iban: z.string()
    .trim()
    .toUpperCase()
    .transform((val) => val.replace(/\s+/g, ''))
    .refine((val) => /^AO06\d{21}$/.test(val), {
      message: 'IBAN inválido. Deve começar com AO06 e conter 25 caracteres (excluindo espaços)',
    }),
  biography: z.string()
    .trim()
    .min(20, 'A biografia deve ter pelo menos 20 caracteres')
    .max(500, 'A biografia não pode exceder 500 caracteres'),
  profilePhoto: z.custom<File>((val) => val instanceof File, 'A foto de perfil é obrigatória')
    .refine((file) => file && file.size <= 5 * 1024 * 1024, 'A foto deve ter no máximo 5MB')
    .refine((file) => file && ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type), 'Apenas formatos PNG, JPG ou JPEG são permitidos'),
})

const formSchema = z.discriminatedUnion('profession', [
  z.object({
    profession: z.literal('Arquiteto'),
    ...baseArchitectSchema.shape,
  }),
  z.object({
    profession:  z.literal('Cliente'),
    name:        z.string().trim().min(1, 'O nome é obrigatório'),
    email:       z.string().min(1, 'O e-mail é obrigatório').email('Formato inválido'),
    phoneNumber: z
      .string()
      .min(1, 'O número de telefone é obrigatório')
      .regex(/^\d{9}$/, 'O número deve ter exatamente 9 dígitos'),
    password:    z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  }),
])

type FormFields = z.infer<typeof formSchema>
type Step = 1 | 2 | 3

export function DuriaRegistrationForm() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register: registerUser, login } = useAuth() as any

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    
    defaultValues: {
      profession:   undefined,
      name:         '',
      email:        '',
      phoneNumber:  '',
      password:     '',
      gender:       undefined,
      address:      '',
      nif:          '',
      iban:         '',
      biography:    '',
      profilePhoto: undefined,
    },
  })

  const architectErrors = errors as FieldErrors<z.infer<typeof baseArchitectSchema>>
  const selectedProfession = watch('profession')
  const isArchitect = selectedProfession === 'Arquiteto'

  const handleNext = async () => {
    let fieldsToValidate: Array<keyof z.infer<typeof baseArchitectSchema>> = []

    if (currentStep === 1) {
      fieldsToValidate = ['name', 'email', 'phoneNumber', 'password', 'gender', 'address']
    } else if (currentStep === 2) {
      fieldsToValidate = ['nif', 'iban', 'profilePhoto', 'biography']
    }

    const isStepValid = await trigger(fieldsToValidate as any)
    console.log(`[Step ${currentStep}] válido:`, isStepValid, '| erros:', errors)

    if (isStepValid && currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as Step)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue('profilePhoto', file, { shouldValidate: true })
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: FormFields) => {
    console.log('[onSubmit] chamado com dados:', data)
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      if (data.profession === 'Arquiteto') {
        formData.append('name',        data.name)
        formData.append('email',       data.email)
        formData.append('password',    data.password)
        formData.append('phoneNumber', data.phoneNumber ?? '')
        formData.append('gender',      data.gender ?? '')
        formData.append('address',     data.address ?? '')
        formData.append('nif',         data.nif ?? '')
        formData.append('iban',        data.iban ?? '')
        formData.append('biography',   data.biography ?? '')
        if (data.profilePhoto instanceof File) {
          formData.append('profilePhoto', data.profilePhoto)
        }

        console.log('[onSubmit] a enviar para /api/auth/register/arquiteto')
        await registerUser(formData, 'arquiteto')
        console.log('[onSubmit] registo concluído, a fazer login...')
        await login(data.email, data.password)
        console.log('[onSubmit] login concluído, a redirecionar...')
        window.location.href = 'Develop/dashboard'

      } else {
        formData.append('name',        data.name)
        formData.append('email',       data.email)
        formData.append('password',    data.password)
        formData.append('phoneNumber', data.phoneNumber ?? '')

        console.log('[onSubmit] a enviar para /api/auth/register/cliente')
        await registerUser(formData, 'cliente')
        console.log('[onSubmit] registo cliente concluído, a redirecionar...')
        window.location.href = 'Develop/dashboard'
      }
    } catch (err: any) {
      console.error('[onSubmit] erro:', err)
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-6 md:p-12 overflow-y-auto">
      <div className="w-full max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Junte-se a Duria</h1>
          <p className="text-slate-600">Crie sua conta profissional</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit, (erros) => {
         
          console.error('[handleSubmit] erros de validação:', erros)
        })} className="space-y-6">

          {/* Seleção de Profissão */}
          <div className="space-y-2">
            <Label htmlFor="profession" className="text-sm font-semibold text-slate-900">
              Tipo de profissão
            </Label>
            <Controller
              name="profession"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                    setCurrentStep(1)
                    setPhotoPreview(null)
                  }}
                >
                  <SelectTrigger className="h-10 border-slate-200 bg-slate-50">
                    <SelectValue placeholder="Selecione a profissão" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFESSIONS.map((prof) => (
                      <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Fluxo Arquiteto */}
          {isArchitect && (
            <>
              {/* Indicador de Etapas */}
              <div className="flex items-center gap-3 py-4">
                {([1, 2, 3] as const).map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step === currentStep
                        ? 'bg-blue-500 text-white shadow-lg'
                        : step < currentStep
                          ? 'bg-slate-300 text-slate-700'
                          : 'bg-slate-100 text-slate-500'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-8 h-1 mx-1 rounded-full transition-all ${
                        step < currentStep ? 'bg-slate-300' : 'bg-slate-100'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* ETAPA 1: Pessoal */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900">Informações pessoais</h2>
                  <div className="space-y-3">

                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700">Nome completo</Label>
                      <Input id="name" placeholder="Nome completo" className="h-10 border-slate-200 bg-slate-50" {...register('name')} />
                      {architectErrors.name?.message && <p className="text-red-500 text-xs mt-1">{architectErrors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                        <Input id="email" type="email" placeholder="exemplo@email.com" className="h-10 border-slate-200 bg-slate-50" {...register('email')} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber" className="text-sm font-medium text-slate-700">Telefone</Label>
                        <Input id="phoneNumber" placeholder="9XX XXX XXX" className="h-10 border-slate-200 bg-slate-50" {...register('phoneNumber')} />
                        {architectErrors.phoneNumber?.message && <p className="text-red-500 text-xs mt-1">{architectErrors.phoneNumber.message}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-sm font-medium text-slate-700">Senha</Label>
                      <Input id="password" type="password" placeholder="Mínimo 8 caracteres" className="h-10 border-slate-200 bg-slate-50" {...register('password')} />
                      {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="gender" className="text-sm font-medium text-slate-700">Gênero</Label>
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="h-10 border-slate-200 bg-slate-50">
                              <SelectValue placeholder="Selecione o gênero" />
                            </SelectTrigger>
                            <SelectContent>
                              {GENDERS.map((g) => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {architectErrors.gender?.message && <p className="text-red-500 text-xs mt-1">{architectErrors.gender.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-sm font-medium text-slate-700">Endereço</Label>
                      <Input id="address" placeholder="Endereço da rua" className="h-10 border-slate-200 bg-slate-50" {...register('address')} />
                      {architectErrors.address?.message && <p className="text-red-500 text-xs mt-1">{architectErrors.address.message}</p>}
                    </div>

                  </div>
                </div>
              )}

              {/* ETAPA 2: Financeiro e Perfil */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900">Financeiro e Perfil</h2>
                  <div className="space-y-3">

                    <div>
                      <Label htmlFor="nif" className="text-sm font-medium text-slate-700">NIF</Label>
                      <Input id="nif" placeholder="NIF" className="h-10 border-slate-200 bg-slate-50" {...register('nif')} />
                      {architectErrors.nif?.message && <p className="text-red-500 text-xs mt-1">{architectErrors.nif.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="iban" className="text-sm font-medium text-slate-700">IBAN</Label>
                      <Input id="iban" placeholder="AO06 0000 0000 0000 0000 0000 0" className="h-10 border-slate-200 bg-slate-50" {...register('iban')} />
                      {architectErrors.iban?.message && <p className="text-red-500 text-xs mt-1">{architectErrors.iban.message}</p>}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-slate-700 block mb-2">Foto do perfil</Label>
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-blue-500 transition-colors relative">
                        <input
                          type="file"
                          id="photo-upload"
                          accept="image/png, image/jpg, image/jpeg"
                          aria-label="Carregar foto de perfil"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handlePhotoChange}
                        />
                        {photoPreview ? (
                          <div className="flex flex-col items-center justify-center pointer-events-none">
                            <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover mb-2" />
                            <span className="text-sm text-blue-600 font-medium">Alterar foto</span>
                          </div>
                        ) : (
                          <div className="pointer-events-none">
                            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600">Clique para carregar ou arraste e solte.</p>
                            <p className="text-xs text-slate-500">PNG, JPG até 5MB</p>
                          </div>
                        )}
                      </div>
                      {architectErrors.profilePhoto?.message && <p className="text-red-500 text-xs mt-1">{architectErrors.profilePhoto.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="biography" className="text-sm font-medium text-slate-700">Biografia</Label>
                      <Textarea id="biography" placeholder="Diz-nos um pouco sobre si..." className="border-slate-200 bg-slate-50 min-h-24" {...register('biography')} />
                      {architectErrors.biography?.message && <p className="text-red-500 text-xs mt-1">{architectErrors.biography.message}</p>}
                    </div>

                  </div>
                </div>
              )}

              {/* ETAPA 3: Revisão */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900">Revise suas informações</h2>
                  <div className="space-y-4">

                    <Card className="border-slate-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Pessoal</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Nome:</span>
                          <span className="font-medium text-slate-900">{watch('name')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Email:</span>
                          <span className="font-medium text-slate-900">{watch('email')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Endereço:</span>
                          <span className="font-medium text-slate-900">{watch('address')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">NIF:</span>
                          <span className="font-medium text-slate-900">{watch('nif')}</span>
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
                          <p className="font-medium text-slate-900">{watch('iban')}</p>
                        </div>
                        {photoPreview && (
                          <img src={photoPreview} alt="Profile" className="w-20 h-20 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Biografia</p>
                          <p className="text-sm text-slate-900 italic">{watch('biography')}</p>
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                </div>
              )}

              {/* Navegação */}
              <div className="flex gap-3 pt-6">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1 border-slate-300 text-slate-900 hover:bg-slate-50">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                )}
                {currentStep < 3 ? (
                  <Button type="button" onClick={handleNext} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                    Próximo <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                    {isSubmitting ? 'A registar...' : 'Completar Registro'}
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Fluxo Cliente */}
          {selectedProfession && !isArchitect && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Crie sua conta</h2>
              <div className="space-y-3">

                <div>
                  <Label htmlFor="std-name" className="text-sm font-medium text-slate-700">Nome completo</Label>
                  <Input id="std-name" placeholder="Nome completo" className="h-10 border-slate-200 bg-slate-50" {...register('name')} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="std-email" className="text-sm font-medium text-slate-700">Email</Label>
                  <Input id="std-email" type="email" placeholder="your@email.com" className="h-10 border-slate-200 bg-slate-50" {...register('email')} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <Label htmlFor="std-phone" className="text-sm font-medium text-slate-700">Telefone</Label>
                  <Input id="std-phone" placeholder="9XX XXX XXX" className="h-10 border-slate-200 bg-slate-50" {...register('phoneNumber')} />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
                </div>

                <div>
                  <Label htmlFor="std-password" className="text-sm font-medium text-slate-700">Senha</Label>
                  <Input id="std-password" type="password" placeholder="••••••••" className="h-10 border-slate-200 bg-slate-50" {...register('password')} />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-500 hover:bg-blue-600 text-white h-10">
                {isSubmitting ? 'A criar conta...' : 'Criar uma conta'}
              </Button>
            </div>
          )}

        </form>

        <p className="text-center text-sm text-slate-600 mt-8">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}