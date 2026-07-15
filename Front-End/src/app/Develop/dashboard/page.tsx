"use client"
import DashboardLayout from "@/app/Develop/dashboard/components/dashboard-layout"
import { ArchitecturalPlans } from "@/app/Develop/dashboard/components/architectural-plans"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        
        <ArchitecturalPlans />
      </div>
    </DashboardLayout>
  )
}
