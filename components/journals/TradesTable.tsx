import { Trade } from '@/lib/store'

interface TradesTableProps {
  trades: Trade[]
  currency: string
}

/**
 * Trades table component
 * Displays trades in a table format
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

  const getResult = (profitLoss: number): { label: string; className: string } => {
    if (profitLoss > 0) {
      return { label: 'Win', className: 'text-green-400' }
    } else if (profitLoss < 0) {
      return { label: 'Loss', className: 'text-red-400' }
    } else {
      return { label: 'BE', className: 'text-gray-400' }
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
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">P/L</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">RR</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Result</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => {
            const result = getResult(trade.profitLoss)
            return (
              <tr
                key={trade.id}
                className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-300">{formatDate(trade.tradeDate)}</td>
                <td
                  className={`py-3 px-4 text-sm text-right font-medium ${
                    trade.profitLoss > 0
                      ? 'text-green-400'
                      : trade.profitLoss < 0
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }`}
                >
                  {formatCurrency(trade.profitLoss)}
                </td>
                <td className="py-3 px-4 text-sm text-right text-gray-300">
                  {trade.riskReward.toFixed(2)}
                </td>
                <td className={`py-3 px-4 text-sm text-right font-medium ${result.className}`}>
                  {result.label}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

