'use client'

interface JournalTabsProps {
  activeTab: 'trades' | 'data' | 'settings'
  onTabChange: (tab: 'trades' | 'data' | 'settings') => void
}

/**
 * Journal tabs component
 * Displays Trades, Data, and Settings tabs
 */
export default function JournalTabs({
  activeTab,
  onTabChange,
}: JournalTabsProps) {
  return (
    <div className="flex space-x-1 mb-6 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <button
        onClick={() => onTabChange('trades')}
        className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
          activeTab === 'trades'
            ? 'text-purple-600 dark:text-white border-b-2 border-purple-600 dark:border-purple-500'
            : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white'
        }`}
      >
        Trades
      </button>
      <button
        onClick={() => onTabChange('data')}
        className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
          activeTab === 'data'
            ? 'text-purple-600 dark:text-white border-b-2 border-purple-600 dark:border-purple-500'
            : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white'
        }`}
      >
        Data
      </button>
      <button
        onClick={() => onTabChange('settings')}
        className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
          activeTab === 'settings'
            ? 'text-purple-600 dark:text-white border-b-2 border-purple-600 dark:border-purple-500'
            : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white'
        }`}
      >
        Settings
      </button>
    </div>
  )
}



