'use client'

import { useState, useEffect } from 'react'

interface JournalSettingsProps {
  journalId: string
}

interface AttributeSettings {
  confidenceLevel: boolean
  image: boolean
  thoughts: boolean
}

/**
 * Journal settings component
 * Allows toggling optional trade attributes
 * Currently uses local state (backend persistence pending)
 */
export default function JournalSettings({ journalId }: JournalSettingsProps) {
  const [settings, setSettings] = useState<AttributeSettings>({
    confidenceLevel: true,
    image: true,
    thoughts: true,
  })

  const [hasBackendSupport, setHasBackendSupport] = useState(false)

  // Load settings from localStorage (temporary until backend is ready)
  useEffect(() => {
    const saved = localStorage.getItem(`journal_settings_${journalId}`)
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [journalId])

  // Save to localStorage when settings change
  useEffect(() => {
    localStorage.setItem(`journal_settings_${journalId}`, JSON.stringify(settings))
  }, [journalId, settings])

  const handleToggle = (key: keyof AttributeSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Backend Support Banner */}
      {!hasBackendSupport && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-md text-yellow-400 text-sm">
          <p className="font-medium mb-1">Backend wiring pending</p>
          <p className="text-yellow-300">
            Settings are saved locally for this session. Backend persistence will be added soon.
          </p>
        </div>
      )}

      {/* Standard Fields Info */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Standard Fields</h3>
        <p className="text-sm text-gray-400 mb-4">
          These fields are always included in every trade:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 ml-4">
          <li>Trade Date</li>
          <li>Outcome (Win/Loss/Break Even)</li>
          <li>Risk Amount</li>
          <li>Risk/Reward Ratio</li>
          <li>Profit/Loss</li>
        </ul>
      </div>

      {/* Optional Fields */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Optional Fields</h3>
        <p className="text-sm text-gray-400 mb-4">
          Toggle these fields to customize your trade entry form:
        </p>
        <div className="space-y-4">
          {/* Confidence Level */}
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <div>
              <label className="text-sm font-medium text-white cursor-pointer">
                Confidence Level
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Rate your confidence in the trade setup
              </p>
            </div>
            <button
              onClick={() => handleToggle('confidenceLevel')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.confidenceLevel ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.confidenceLevel ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Image */}
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <div>
              <label className="text-sm font-medium text-white cursor-pointer">
                Screenshot/Image
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Upload trade screenshots or charts
              </p>
            </div>
            <button
              onClick={() => handleToggle('image')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.image ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.image ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Thoughts/Notes */}
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <div>
              <label className="text-sm font-medium text-white cursor-pointer">
                Thoughts/Notes
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Add notes and reflections about the trade
              </p>
            </div>
            <button
              onClick={() => handleToggle('thoughts')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.thoughts ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.thoughts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

