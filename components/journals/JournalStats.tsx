'use client'

import { useMemo } from 'react'
import type { Trade } from '@/lib/api/trades'
import {
  computeEquityByDay,
  computeOutcomeCounts,
} from '@/lib/analytics'
import StatCards from './data/StatCards'
import EquityCurve from './data/EquityCurve'
import OutcomeDonut from './data/OutcomeDonut'
import PnLCalendar from './data/PnLCalendar'

interface JournalStatsProps {
  trades: Trade[]
  startingCapital: number
  currentCapital: number
  currency: string
}

/**
 * Journal statistics component
 * Displays analytics, charts, and calendar view
 */
export default function JournalStats({
  trades,
  startingCapital,
  currentCapital,
  currency,
}: JournalStatsProps) {
  // Compute analytics data (memoized for performance)
  const equityData = useMemo(
    () => computeEquityByDay(trades, startingCapital),
    [trades, startingCapital]
  )

  const outcomeCounts = useMemo(
    () => computeOutcomeCounts(trades),
    [trades]
  )

  const totalPL = useMemo(
    () => trades.reduce((sum, t) => sum + t.profitLoss, 0),
    [trades]
  )

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <StatCards
        trades={trades}
        totalPL={totalPL}
        currentCapital={currentCapital}
        currency={currency}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Equity Curve</h3>
          <EquityCurve data={equityData} currency={currency} />
        </div>

        {/* Outcome Donut */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Wins vs Losses vs BE</h3>
          <OutcomeDonut data={outcomeCounts} />
        </div>
      </div>

      {/* Calendar P/L */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Calendar P/L</h3>
        <PnLCalendar trades={trades} currency={currency} />
      </div>
    </div>
  )
}
