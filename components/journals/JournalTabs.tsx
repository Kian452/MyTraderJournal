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
    <div className="flex space-x-1 mb-6 border-b border-gray-700">
      <button
        onClick={() => onTabChange('trades')}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          activeTab === 'trades'
            ? 'text-white border-b-2 border-blue-500'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Trades
      </button>
      <button
        onClick={() => onTabChange('data')}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          activeTab === 'data'
            ? 'text-white border-b-2 border-blue-500'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Data
      </button>
      <button
        onClick={() => onTabChange('settings')}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          activeTab === 'settings'
            ? 'text-white border-b-2 border-blue-500'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Settings
      </button>
    </div>
  )
}



