'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { OutcomeCounts } from '@/lib/analytics'

interface OutcomeDonutProps {
  data: OutcomeCounts
}

/**
 * Wins vs Losses vs BE donut chart component
 */
export default function OutcomeDonut({ data }: OutcomeDonutProps) {
  if (data.total === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No trades to display</p>
      </div>
    )
  }

  const chartData = [
    {
      name: 'Wins',
      value: data.wins,
      percentage: data.total > 0 ? ((data.wins / data.total) * 100).toFixed(1) : '0',
      color: '#10B981', // green
    },
    {
      name: 'Losses',
      value: data.losses,
      percentage: data.total > 0 ? ((data.losses / data.total) * 100).toFixed(1) : '0',
      color: '#EF4444', // red
    },
    {
      name: 'Breakeven',
      value: data.breakevens,
      percentage: data.total > 0 ? ((data.breakevens / data.total) * 100).toFixed(1) : '0',
      color: '#6B7280', // gray
    },
  ].filter((item) => item.value > 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-md p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-gray-300 text-sm">
            Count: {data.value} ({data.payload.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show label for very small slices

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value, entry: any) => (
              <span className="text-gray-300 text-sm">
                {value} ({entry.payload.percentage}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

