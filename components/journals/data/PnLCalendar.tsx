'use client'

import { useState, useMemo } from 'react'
import type { Trade } from '@/lib/store'
import type { DailyPnL } from '@/lib/analytics'

interface PnLCalendarProps {
  trades: Trade[]
  currency: string
}

/**
 * Calendar P/L view component
 * Shows monthly calendar grid with daily P/L
 */
export default function PnLCalendar({ trades, currency }: PnLCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Compute daily P/L map
  const dailyPnLMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const trade of trades) {
      const dateStr = new Date(trade.tradeDate).toISOString().split('T')[0]
      map.set(dateStr, (map.get(dateStr) || 0) + trade.profitLoss)
    }
    return map
  }, [trades])

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // First day of month
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Get day of week for first day (0 = Sunday, 6 = Saturday)
    const startDay = firstDay.getDay()

    // Generate calendar days
    const days: Array<{ day: number; date: Date; pnl: number | null }> = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push({ day: 0, date: new Date(year, month, -startDay + i + 1), pnl: null })
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const pnl = dailyPnLMap.get(dateStr) || null
      days.push({ day, date, pnl })
    }

    return days
  }, [currentDate, dailyPnLMap])

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getDayStyle = (pnl: number | null) => {
    if (pnl === null) return 'bg-gray-800/30 text-gray-600'
    if (pnl > 0) return 'bg-green-500/20 text-green-400 border-green-500/30'
    if (pnl < 0) return 'bg-red-500/20 text-red-400 border-red-500/30'
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="text-gray-400 hover:text-white transition-colors px-2 py-1"
          aria-label="Previous month"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-white">{monthName}</h3>
          <button
            onClick={goToToday}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Today
          </button>
        </div>
        <button
          onClick={goToNextMonth}
          className="text-gray-400 hover:text-white transition-colors px-2 py-1"
          aria-label="Next month"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day names header */}
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-400 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarData.map((item, index) => (
          <div
            key={index}
            className={`min-h-[60px] p-2 rounded border ${
              item.day === 0
                ? 'bg-transparent border-transparent'
                : `${getDayStyle(item.pnl)} border`
            }`}
          >
            {item.day > 0 && (
              <>
                <div className="text-xs text-gray-300 mb-1">{item.day}</div>
                {item.pnl !== null && (
                  <div className="text-xs font-medium">
                    {item.pnl >= 0 ? '+' : ''}
                    {formatCurrency(item.pnl)}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center space-x-4 mt-4 text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500/20 border border-green-500/30 rounded"></div>
          <span>Profit</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded"></div>
          <span>Loss</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-500/20 border border-gray-500/30 rounded"></div>
          <span>Breakeven</span>
        </div>
      </div>
    </div>
  )
}

