'use client'

import type { Trade } from '@/lib/api/trades'

interface TradesTableProps {
  trades: Trade[]
  currency: string
  onEdit?: (trade: Trade) => void
  onDelete?: (tradeId: string) => void
}

/**
 * Trades table component
 * Displays trades in a table format with edit/delete actions
 */
export default function TradesTable({
  trades,
  currency,
  onEdit,
  onDelete,
}: TradesTableProps) {
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

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'WIN':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            WIN
          </span>
        )
      case 'LOSS':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            LOSS
          </span>
        )
      case 'BE':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
            BE
          </span>
        )
      default:
        return <span className="text-gray-300">{outcome}</span>
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
            {(onEdit || onDelete) && (
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => {
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
                <td className="py-3 px-4 text-sm text-center">
                  {getOutcomeBadge(trade.outcome)}
                </td>
                <td className="py-3 px-4 text-sm text-right text-gray-300">
                  {formatCurrency(trade.riskAmount)}
                </td>
                <td className="py-3 px-4 text-sm text-right text-gray-300 font-medium">
                  {trade.rMultiple >= 0 ? '+' : ''}
                  {trade.rMultiple.toFixed(2)}R
                </td>
                <td className={`py-3 px-4 text-sm text-right font-medium ${plStyle}`}>
                  {formatCurrency(trade.profitLoss)}
                </td>
                {(onEdit || onDelete) && (
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end items-center space-x-2">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(trade)
                          }}
                          className="text-gray-400 hover:text-blue-400 transition-colors p-1"
                          aria-label={`Edit trade from ${formatDate(trade.tradeDate)}`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(trade.id)
                          }}
                          className="text-gray-400 hover:text-red-400 transition-colors p-1"
                          aria-label={`Delete trade from ${formatDate(trade.tradeDate)}`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
