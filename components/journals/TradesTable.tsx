import { Trade } from '@/lib/store'

interface TradesTableProps {
  trades: Trade[]
  currency: string
}

/**
 * Trades table component
 * Displays trades in a table format with new columns
 */
export default function TradesTable({ trades, currency }: TradesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  const getOutcomeStyle = (outcome: string) => {
    switch (outcome) {
      case 'WIN':
        return 'text-green-400'
      case 'LOSS':
        return 'text-red-400'
      case 'BE':
        return 'text-gray-400'
      default:
        return 'text-gray-300'
    }
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No trades yet. Add your first trade to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Outcome</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Risk</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">R</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">P/L</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => {
            const outcomeStyle = getOutcomeStyle(trade.outcome)
            const plStyle =
              trade.profitLoss > 0
                ? 'text-green-400'
                : trade.profitLoss < 0
                ? 'text-red-400'
                : 'text-gray-400'

            return (
              <tr
                key={trade.id}
                className={`border-b border-gray-800 hover:bg-gray-800/30 transition-colors ${
                  trade.outcome === 'WIN'
                    ? 'bg-green-500/5'
                    : trade.outcome === 'LOSS'
                    ? 'bg-red-500/5'
                    : ''
                }`}
              >
                <td className="py-3 px-4 text-sm text-gray-300">
                  {formatDate(trade.tradeDate)}
                </td>
                <td className={`py-3 px-4 text-sm text-center font-medium ${outcomeStyle}`}>
                  {trade.outcome}
                </td>
                <td className="py-3 px-4 text-sm text-right text-gray-300">
                  {formatCurrency(trade.riskAmount)}
                </td>
                <td className="py-3 px-4 text-sm text-right text-gray-300">
                  {trade.rMultiple >= 0 ? '+' : ''}
                  {trade.rMultiple.toFixed(2)}R
                </td>
                <td className={`py-3 px-4 text-sm text-right font-medium ${plStyle}`}>
                  {formatCurrency(trade.profitLoss)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
