import DashboardLayout from "@/app/dashboard/components/dashboard-layout"

export default function Eventos() {
  return (
     <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
        <p className="text-muted-foreground">
          Gerencie os seus Eventos e participe de atividades exclusivas.
        </p>
       </div>
      
       <div className="flex flex-col gap-4">
        {/* O resto */}
      </div>
      </div>
        </DashboardLayout>
  )
}