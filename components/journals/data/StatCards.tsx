import type { Trade } from '@/lib/api/trades'
import {
  computeWinrate,
  computeAvgR,
  computeAvgTradesPerDay,
} from '@/lib/analytics'

interface StatCardsProps {
  trades: Trade[]
  totalPL: number
  currentCapital: number
  currency: string
}

/**
 * Stat cards component
 * Displays key metrics in a grid
 */
export default function StatCards({
  trades,
  totalPL,
  currentCapital,
  currency,
}: StatCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const tradesCount = trades.length
  const winrate = computeWinrate(trades)
  const avgR = computeAvgR(trades)
  const avgTradesPerDay = computeAvgTradesPerDay(trades)

  const stats = [
    {
      label: 'Trades',
      value: tradesCount.toString(),
    },
    {
      label: 'Total P/L',
      value: formatCurrency(totalPL),
      valueColor: totalPL >= 0 ? 'text-green-400' : 'text-red-400',
    },
    {
      label: 'Winrate',
      value: `${winrate.toFixed(1)}%`,
    },
    {
      label: 'Avg R',
      value: avgR >= 0 ? `+${avgR.toFixed(2)}R` : `${avgR.toFixed(2)}R`,
    },
    {
      label: 'Current Capital',
      value: formatCurrency(currentCapital),
    },
    {
      label: 'Avg Trades/Day',
      value: avgTradesPerDay.toFixed(2),
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
        >
          <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
          <div
            className={`text-lg font-semibold text-white ${
              stat.valueColor || ''
            }`}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  )
}

