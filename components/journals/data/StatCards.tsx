import type { Trade } from '@/lib/api/trades'
import {
  computeWinrate,
  computeAvgRR,
  computeAvgTradesPerDay,
} from '@/lib/analytics'

interface StatCardsProps {
  trades: Trade[]
  totalPL: number
  currentCapital: number
  currency: string
}

interface StatItem {
  label: string
  value: string
  valueColor?: string
  tooltip?: string
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
  const avgRR = computeAvgRR(trades)
  const avgTradesPerDay = computeAvgTradesPerDay(trades)

  const stats: StatItem[] = [
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
      label: 'Avg RR',
      value: `${avgRR.toFixed(2)}R`,
      tooltip: 'Average planned risk-to-reward per trade',
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
          className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700"
        >
          <div className="flex items-center gap-1 mb-1">
            <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">{stat.label}</div>
            {stat.tooltip && (
              <div className="group relative">
                <svg
                  className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-help"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {stat.tooltip}
                </div>
              </div>
            )}
          </div>
          <div
            className={`text-lg font-semibold text-gray-900 dark:text-white transition-colors ${
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

