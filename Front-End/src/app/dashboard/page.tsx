import DashboardLayout from "@/app/dashboard/components/dashboard-layout"
import { ArchitecturalPlans } from "@/app/dashboard/components/architectural-plans"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Architectural Plans</h1>
          <p className="text-muted-foreground">
            Browse and purchase high-quality architectural plans for your next project.
          </p>
        </div>
        <ArchitecturalPlans />
      </div>
    </DashboardLayout>
  )
}

