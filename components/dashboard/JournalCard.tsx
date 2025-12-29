import Link from 'next/link'
import { Journal } from '@/lib/mockJournals'

interface JournalCardProps {
  journal: Journal
}

/**
 * Journal card component
 * Displays journal information in a card format
 */
export default function JournalCard({ journal }: JournalCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  const profitLoss = journal.currentCapital - journal.startingCapital
  const profitLossPercent = ((profitLoss / journal.startingCapital) * 100).toFixed(1)

  return (
    <Link
      href={`/dashboard/journals/${journal.id}`}
      className="block bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:bg-gray-800 hover:border-gray-600 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{journal.name}</h3>
        <span
          className={`text-sm font-medium px-2 py-1 rounded ${
            profitLoss >= 0
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {profitLoss >= 0 ? '+' : ''}
          {profitLossPercent}%
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Current Capital</span>
          <span className="text-lg font-semibold text-white">
            {formatCurrency(journal.currentCapital, journal.currency)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Starting Capital</span>
          <span className="text-sm text-gray-300">
            {formatCurrency(journal.startingCapital, journal.currency)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-700">
          <span className="text-sm text-gray-400">Trades</span>
          <span className="text-sm font-medium text-gray-300">
            {journal.tradesCount}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Last Updated</span>
          <span className="text-sm text-gray-300">
            {formatDate(journal.lastUpdated)}
          </span>
        </div>
      </div>
    </Link>
  )
}

