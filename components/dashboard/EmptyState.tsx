/**
 * Empty state component
 */
interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon/Illustration */}
      <div className="mb-6">
        <svg
          className="w-24 h-24 text-purple-300 dark:text-purple-600 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      {/* Headline */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center transition-colors">
        {title}
      </h2>

      {/* Supporting Text */}
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6 transition-colors">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

