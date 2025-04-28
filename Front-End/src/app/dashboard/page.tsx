import DashboardLayout from "@/app/dashboard/components/dashboard-layout"
import { ArchitecturalPlans } from "@/app/dashboard/components/architectural-plans"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Plantas Arquiteturas</h1>
          <p className="text-muted-foreground">
            Navegue e compre planos arquitetônicos de alta qualidade para seu próximo projecto.
          </p>
        </div>
        <ArchitecturalPlans />
      </div>
    </DashboardLayout>
  )
}
