'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Lock, Trophy } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface RevenueGoalCardProps {
  revenue: number
  onWithdrawClick: () => void
}

export function RevenueGoalCard({ revenue, onWithdrawClick }: RevenueGoalCardProps) {
  const WITHDRAWAL_MIN = 200
  const WITHDRAWAL_MAX = 1000
  
  const isLocked = revenue < WITHDRAWAL_MIN
  const isElite = revenue >= WITHDRAWAL_MAX
  
  // Calculate progress percentage (capped at 100% for values above max)
  const progressPercent = Math.min((revenue / WITHDRAWAL_MAX) * 100, 100)
  
  // Calculate position of min threshold on progress bar
  const minThresholdPercent = (WITHDRAWAL_MIN / WITHDRAWAL_MAX) * 100

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-blue-500" />
           Receita e Saque
          </CardTitle>
          {isElite && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Vendedor Elite
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Revenue Amount */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900">${revenue.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">Ganhos</span>
        </div>

        {/* Progress Bar with Milestones */}
        <div className="space-y-2">
          <div className="relative">
            <Progress value={progressPercent} className="h-3 bg-slate-200" />
            
            {/* Milestone Markers */}
            <div className="relative mt-1 h-4 pointer-events-none">
              {/* Min threshold marker */}
              <div
                className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${minThresholdPercent}%` }}
              >
                <div className="w-1 h-3 bg-blue-400" />
                <span className="text-xs font-medium text-blue-600 whitespace-nowrap">$200</span>
              </div>
              
              {/* Max threshold marker */}
              <div className="absolute top-0 right-0 transform translate-x-1/2 flex flex-col items-center">
                <div className="w-1 h-3 bg-blue-600" />
                <span className="text-xs font-medium text-blue-700 whitespace-nowrap">$1000</span>
              </div>
            </div>
          </div>

          {/* Status Label */}
          <p className="text-xs text-muted-foreground">
            {isLocked ? (
              <>Saque disponivel a partir de <span className="font-semibold text-slate-700">${WITHDRAWAL_MIN.toLocaleString()}</span></>
            ) : isElite ? (
              <>Status Elite desbloqueado! Você pode sacar quando quiser.</>
            ) : (
              <>${(WITHDRAWAL_MAX - revenue).toLocaleString()} para o status de elite</>
            )}
          </p>
        </div>

        {/* Withdraw Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button
                  onClick={onWithdrawClick}
                  disabled={isLocked}
                  className={`w-full h-10 font-medium transition-all ${
                    isLocked
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : isElite
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isLocked ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                     Retirar fundos
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                     Retirar fundos
                    </>
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            {isLocked && (
              <TooltipContent className="bg-slate-900 text-white border-0">
                <p className="text-sm">Reach ${WITHDRAWAL_MIN.toLocaleString()} para desbloquear saque</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
