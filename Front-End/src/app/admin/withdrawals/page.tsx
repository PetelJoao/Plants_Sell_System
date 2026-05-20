"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ChevronDown, Upload, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Withdrawal {
  id: number
  architectName: string
  architectAvatar: string
  iban: string
  amount: number
  requestDate: string
  status: "Pending" | "Paid"
  proofUrl?: string
}

const initialWithdrawals: Withdrawal[] = [
  {
    id: 1,
    architectName: "João Silva",
    architectAvatar: "JS",
    iban: "PT50 **** **** 1234",
    amount: 5000,
    requestDate: "2024-03-10",
    status: "Pending",
  },
  {
    id: 2,
    architectName: "Maria Santos",
    architectAvatar: "MS",
    iban: "PT50 **** **** 5678",
    amount: 3500,
    requestDate: "2024-03-08",
    status: "Paid",
    proofUrl: "/proof-001.pdf",
  },
  {
    id: 3,
    architectName: "Carlos Costa",
    architectAvatar: "CC",
    iban: "PT50 **** **** 9012",
    amount: 7200,
    requestDate: "2024-03-05",
    status: "Pending",
  },
]

export default function WithdrawalsPage() {
  const { toast } = useToast()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals)
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Paid">("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => {
      const matchesSearch = w.architectName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "All" || w.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [withdrawals, searchQuery, statusFilter])

  const handleManage = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setSheetOpen(true)
  }

  const handleMarkAsPaid = () => {
    if (selectedWithdrawal && uploadedFile) {
      setWithdrawals((prev) =>
        prev.map((w) =>
          w.id === selectedWithdrawal.id
            ? { ...w, status: "Paid", proofUrl: URL.createObjectURL(uploadedFile) }
            : w
        )
      )
      toast({
        title: "Withdrawal Marked as Paid",
        description: `${selectedWithdrawal.architectName}'s withdrawal has been processed.`,
      })
      setSheetOpen(false)
      setSelectedWithdrawal(null)
      setUploadedFile(null)
    } else {
      toast({
        title: "Error",
        description: "Please upload a payment proof file.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Withdrawals Management</h1>
        <p className="text-muted-foreground">Manage withdrawal requests and payment proofs</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <Input
                placeholder="Search by architect name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              {(["All", "Pending", "Paid"] as const).map((filter) => (
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
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="font-semibold"></TableHead>
                  <TableHead className="font-semibold">Architect</TableHead>
                  <TableHead className="font-semibold">IBAN</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Request Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id} className="border-slate-200">
                    <TableCell>
                      <button 
                      aria-label="Toggle details"
                      onClick={() => setExpandedId(expandedId === withdrawal.id ? null : withdrawal.id)}>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedId === withdrawal.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold">
                          {withdrawal.architectAvatar}
                        </div>
                        {withdrawal.architectName}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono">{withdrawal.iban}</TableCell>
                    <TableCell className="font-semibold">${withdrawal.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{withdrawal.requestDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          withdrawal.status === "Paid"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {withdrawal.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManage(withdrawal)}
                        className="text-blue-600 hover:text-blue-700 border-blue-200"
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:w-[540px]">
          {selectedWithdrawal && (
            <>
              <SheetHeader>
                <SheetTitle>Withdrawal Details</SheetTitle>
                <SheetDescription>
                  Manage withdrawal request for {selectedWithdrawal.architectName}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 py-6">
                {/* Request Details */}
                <div className="space-y-4 border-b border-slate-200 pb-6">
                  <h3 className="font-semibold text-foreground">Request Information</h3>
                  <div className="grid gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Architect Name</p>
                      <p className="font-medium">{selectedWithdrawal.architectName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">IBAN (Full)</p>
                      <p className="font-medium font-mono text-sm">PT50 1234 1234 1234 1234</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-semibold text-lg">${selectedWithdrawal.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Request Date</p>
                        <p className="font-medium">{selectedWithdrawal.requestDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Proof Upload */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Payment Proof</h3>

                  {selectedWithdrawal.status === "Paid" && selectedWithdrawal.proofUrl ? (
                    <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Proof Document</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-blue-600 hover:text-blue-700 border-blue-200"
                      >
                        Download Proof
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center space-y-3">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="proof-upload"
                      />
                      <label
                        htmlFor="proof-upload"
                        className="flex flex-col items-center gap-2 cursor-pointer"
                      >
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <div className="text-sm">
                          <span className="font-medium text-blue-600 hover:text-blue-700">Upload proof</span>
                          <span className="text-muted-foreground"> or drag and drop</span>
                        </div>
                        <p className="text-xs text-muted-foreground">PDF or image (max 10MB)</p>
                      </label>
                      {uploadedFile && (
                        <div className="text-sm text-green-600 font-medium">
                          File selected: {uploadedFile.name}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {selectedWithdrawal.status === "Pending" && (
                  <div className="flex gap-2 pt-6 border-t border-slate-200">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSheetOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                      onClick={handleMarkAsPaid}
                      disabled={!uploadedFile}
                    >
                      Mark as Paid
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
