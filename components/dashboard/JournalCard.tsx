import Link from 'next/link'
import type { Journal } from '@/lib/api/journals'

interface JournalCardProps {
  journal: Journal
  onDelete: (journalId: string) => void
}

/**
 * Journal card component
 * Displays journal information in a card format
 */
export default function JournalCard({ journal, onDelete }: JournalCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  const profitLoss = journal.currentCapital - journal.startingCapital
  const profitLossPercent = ((profitLoss / journal.startingCapital) * 100).toFixed(1)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(journal.id)
  }

  return (
    <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:bg-gray-800 hover:border-gray-600 transition-all">
      {/* Delete Button */}
      <button
        onClick={handleDeleteClick}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-400 transition-colors p-1"
        aria-label={`Delete ${journal.name}`}
      >
        <svg
          className="w-5 h-5"
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

      <Link
        href={`/dashboard/journals/${journal.id}`}
        className="block cursor-pointer"
      >
        <div className="flex items-start justify-between mb-4 pr-8">
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
            {formatDate(journal.updatedAt)}
          </span>
        </div>
      </div>
      </Link>
    </div>
  )
}

