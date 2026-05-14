"use client"

import DashboardLayout from "@/app/dashboard/components/dashboard-layout"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, Trash2, Edit } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlanUploadDialog } from "@/app/dashboard/components/plan-upload-dialog"
import { PlanEditDialog } from "@/components/plan-edit-dialog"
import { usePlans, type ArchitectPlan } from "@/context/plans-context"



export default function Eventos() {
  return (
     <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Minhas Plantas</h1>
        <p className="text-muted-foreground">
        </p>
       </div>
      
       <div className="flex flex-col gap-4">
        {/* O resto */}
      </div>
      </div>
        </DashboardLayout>
  )
}