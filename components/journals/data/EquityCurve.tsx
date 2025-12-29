'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { EquityPoint } from '@/lib/analytics'

interface EquityCurveProps {
  data: EquityPoint[]
  currency: string
}

/**
 * Equity curve line chart component
 */
export default function EquityCurve({ data, currency }: EquityCurveProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No data available for equity curve</p>
      </div>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#F3F4F6',
            }}
            labelFormatter={(label) => formatDate(label)}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Line
            type="monotone"
            dataKey="equity"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

