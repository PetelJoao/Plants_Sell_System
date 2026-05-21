'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign, Copy, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface WithdrawalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableAmount: number
  architectIBAN?: string
  onConfirm: (amount: number, iban: string) => void
}

export function WithdrawalModal({
  open,
  onOpenChange,
  availableAmount,
  architectIBAN = 'ES91 1234 5678 9012 3456 7890',
  onConfirm,
}: WithdrawalModalProps) {
  const [amount, setAmount] = useState(availableAmount.toString())
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopyIBAN = () => {
    navigator.clipboard.writeText(architectIBAN)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: 'Copied',
      description: 'IBAN copied to clipboard',
      duration: 2000,
    })
  }

  const handleConfirm = () => {
    const withdrawAmount = parseFloat(amount)
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      })
      return
    }
    if (withdrawAmount > availableAmount) {
      toast({
        title: 'Amount Exceeds Available',
        description: `Maximum available: $${availableAmount.toLocaleString()}`,
        variant: 'destructive',
      })
      return
    }
    onConfirm(withdrawAmount, architectIBAN)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>
            Transfer your earnings to your bank account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Available Amount */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">
              Available Balance
            </Label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-900">
                ${availableAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Withdrawal Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount to Withdraw
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={availableAmount}
                min={0}
                step={0.01}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum: ${availableAmount.toLocaleString()}
            </p>
          </div>

          {/* Bank Account Info */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Bank Account (IBAN)</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={architectIBAN}
                disabled
                className="bg-slate-50 text-slate-600"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyIBAN}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Funds will be transferred to this account within 2-3 business days
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Confirm Withdrawal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
