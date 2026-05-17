"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Report {
  id: number
  reporterName: string
  reporterAvatar: string
  reportedName: string
  reportedType: "User" | "Content"
  category: "Inappropriate content" | "Fraud" | "Spam" | "Other"
  description: string
  dateSubmitted: string
  status: "Open" | "Under Review" | "Resolved"
  notes?: string
}

const initialReports: Report[] = [
  {
    id: 1,
    reporterName: "Alice Johnson",
    reporterAvatar: "AJ",
    reportedName: "Suspicious User #123",
    reportedType: "User",
    category: "Fraud",
    description:
      "This user is selling fake architectural plans with watermarks. Multiple customers have complained about quality.",
    dateSubmitted: "2024-03-12",
    status: "Open",
  },
  {
    id: 2,
    reporterName: "Bob Wilson",
    reporterAvatar: "BW",
    reportedName: "Plan #456",
    reportedType: "Content",
    category: "Inappropriate content",
    description: "The uploaded plan contains offensive images and is not suitable for the platform.",
    dateSubmitted: "2024-03-10",
    status: "Under Review",
    notes: "Content has been flagged. Waiting for architect response.",
  },
  {
    id: 3,
    reporterName: "Carol Davis",
    reporterAvatar: "CD",
    reportedName: "Marketing User",
    reportedType: "User",
    category: "Spam",
    description: "User is posting spam links in comments and messages.",
    dateSubmitted: "2024-03-08",
    status: "Resolved",
    notes: "User has been suspended.",
  },
]

export default function ReportsPage() {
  const { toast } = useToast()
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Under Review" | "Resolved">(
    "All"
  )
  const [categoryFilter, setCategoryFilter] = useState<"All" | string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [adminNotes, setAdminNotes] = useState("")

  const categories = ["All", "Inappropriate content", "Fraud", "Spam", "Other"]

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reportedName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "All" || report.status === statusFilter
      const matchesCategory = categoryFilter === "All" || report.category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [reports, searchQuery, statusFilter, categoryFilter])

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report)
    setAdminNotes(report.notes || "")
    setDetailOpen(true)
  }

  const handleStatusChange = (newStatus: Report["status"]) => {
    if (selectedReport) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id ? { ...r, status: newStatus, notes: adminNotes } : r
        )
      )
      setSelectedReport((prev) => (prev ? { ...prev, status: newStatus, notes: adminNotes } : null))
      toast({
        title: "Report Updated",
        description: `Report status changed to ${newStatus}.`,
      })
    }
  }

  const getStatusColor = (status: Report["status"]) => {
    switch (status) {
      case "Open":
        return "bg-red-50 text-red-700 border-red-200"
      case "Under Review":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Resolved":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports Management</h1>
        <p className="text-muted-foreground">Review and manage user reports and complaints</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by reporter or reported name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-2">
                {(["All", "Open", "Under Review", "Resolved"] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={statusFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(filter)}
                    className={statusFilter === filter ? "bg-blue-500 hover:bg-blue-600" : ""}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(category)}
                    className={categoryFilter === category ? "bg-blue-500 hover:bg-blue-600" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="font-semibold">Reporter</TableHead>
                  <TableHead className="font-semibold">Reported</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id} className="border-slate-200">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold">
                          {report.reporterAvatar}
                        </div>
                        {report.reporterName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{report.reportedName}</p>
                        <Badge variant="outline" className="text-xs">
                          {report.reportedType}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{report.category}</TableCell>
                    <TableCell className="text-sm">{report.dateSubmitted}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(report)}
                        className="text-blue-600 hover:text-blue-700 border-blue-200"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle>Report Details</DialogTitle>
                <DialogDescription>Review and manage this report</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Report Summary */}
                <div className="space-y-4 border-b border-slate-200 pb-6">
                  <h3 className="font-semibold flex items-center gap-2 text-foreground">
                    <AlertCircle className="h-4 w-4" />
                    Report Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{selectedReport.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date Submitted</p>
                      <p className="font-medium">{selectedReport.dateSubmitted}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm mt-1">{selectedReport.description}</p>
                  </div>
                </div>

                {/* Reporter Info */}
                <div className="space-y-4 border-b border-slate-200 pb-6">
                  <h3 className="font-semibold text-foreground">Reporter</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-semibold">
                      {selectedReport.reporterAvatar}
                    </div>
                    <div>
                      <p className="font-medium">{selectedReport.reporterName}</p>
                      <p className="text-sm text-muted-foreground">Verified User</p>
                    </div>
                  </div>
                </div>

                {/* Reported Info */}
                <div className="space-y-4 border-b border-slate-200 pb-6">
                  <h3 className="font-semibold text-foreground">Reported {selectedReport.reportedType}</h3>
                  <div>
                    <p className="font-medium">{selectedReport.reportedName}</p>
                    <Badge variant="outline" className="mt-2">
                      {selectedReport.reportedType}
                    </Badge>
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Admin Notes</h3>
                  <Textarea
                    placeholder="Add internal notes about this report..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="resize-none"
                    rows={4}
                  />
                </div>

                {/* Status Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  {selectedReport.status !== "Open" && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleStatusChange("Open")}
                    >
                      Mark as Open
                    </Button>
                  )}
                  {selectedReport.status !== "Under Review" && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleStatusChange("Under Review")}
                    >
                      Mark Under Review
                    </Button>
                  )}
                  {selectedReport.status !== "Resolved" && (
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange("Resolved")}
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
