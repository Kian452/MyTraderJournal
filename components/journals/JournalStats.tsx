import { Trade } from '@/lib/store'

interface JournalStatsProps {
  trades: Trade[]
  startingCapital: number
  currentCapital: number
  currency: string
}

/**
 * Journal statistics component
 * Displays computed stats from trades
 */
export default function JournalStats({
  trades,
  startingCapital,
  currentCapital,
  currency,
}: JournalStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate stats
  const tradesCount = trades.length
  const totalPL = trades.reduce((sum, t) => sum + t.profitLoss, 0)
  const wins = trades.filter((t) => t.profitLoss > 0).length
  const losses = trades.filter((t) => t.profitLoss < 0).length
  const winrate = tradesCount > 0 ? (wins / tradesCount) * 100 : 0
  const avgRR =
    tradesCount > 0
      ? trades.reduce((sum, t) => sum + t.riskReward, 0) / tradesCount
      : 0

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
      label: 'Avg RR',
      value: avgRR > 0 ? avgRR.toFixed(2) : '0.00',
    },
    {
      label: 'Current Capital',
      value: formatCurrency(currentCapital),
    },
  ]

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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

      {/* Placeholder Charts */}
      <div className="space-y-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Equity Curve</h3>
          <p className="text-gray-400 text-sm">Coming soon</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Calendar P/L</h3>
          <p className="text-gray-400 text-sm">Coming soon</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Wins vs Losses</h3>
          <p className="text-gray-400 text-sm">Coming soon</p>
        </div>
      </div>
    </div>
  )
}

