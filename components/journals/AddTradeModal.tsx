'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { TradeOutcome, TradePartial, Trade } from '@/lib/api/trades'
import { computeTrade } from '@/lib/tradeMath'

interface AddTradeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    tradeDate: Date
    outcome: TradeOutcome
    riskAmount: number
    mainRR: number | null
    partials: TradePartial[]
    thoughtProcess?: string | null
  }) => void
  mode?: 'add' | 'edit'
  initialTrade?: Trade
  currency?: string
  journalId?: string
  isSubmitting?: boolean
}

/**
 * Modal for adding or editing a trade
 * Trading-realistic entry with risk amount, outcome, RR, and partials
 * Supports live preview of computed metrics
 */
export default function AddTradeModal({
  isOpen,
  onClose,
  onSubmit,
  mode = 'add',
  initialTrade,
  currency = 'USD',
  journalId,
  isSubmitting = false,
}: AddTradeModalProps) {
  // Load settings from localStorage
  const [settings, setSettings] = useState({
    confidenceLevel: true,
    image: true,
    thoughts: true,
  })

  useEffect(() => {
    if (journalId) {
      const saved = localStorage.getItem(`journal_settings_${journalId}`)
      if (saved) {
        try {
          setSettings(JSON.parse(saved))
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [journalId])
  const [formData, setFormData] = useState({
    tradeDate: new Date().toISOString().split('T')[0],
    outcome: 'WIN' as TradeOutcome,
    riskAmount: '',
    mainRR: '',
    thoughtProcess: '',
  })

  const [partials, setPartials] = useState<Array<{ positionPercent: string; rr: string }>>([])
  const [showPartials, setShowPartials] = useState(false)
  const [errors, setErrors] = useState<{
    riskAmount?: string
    mainRR?: string
    partials?: string
  }>({})

  const modalRef = useRef<HTMLDivElement>(null)

  // Initialize form from initialTrade when editing
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialTrade) {
        setFormData({
          tradeDate: new Date(initialTrade.tradeDate).toISOString().split('T')[0],
          outcome: initialTrade.outcome,
          riskAmount: initialTrade.riskAmount.toString(),
          mainRR: initialTrade.mainRR?.toString() || '',
          thoughtProcess: initialTrade.thoughtProcess || '',
        })
        setPartials(
          initialTrade.partials.map((p) => ({
            positionPercent: (p.sizeFraction * 100).toString(),
            rr: p.rr.toString(),
          }))
        )
        setShowPartials(initialTrade.partials.length > 0)
      } else {
        // Reset for add mode
        setFormData({
          tradeDate: new Date().toISOString().split('T')[0],
          outcome: 'WIN',
          riskAmount: '',
          mainRR: '',
          thoughtProcess: '',
        })
        setPartials([])
        setShowPartials(false)
      }
      setErrors({})
    }
  }, [isOpen, mode, initialTrade])

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      if (modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        firstElement?.focus()
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }

    // If outcome changes to non-WIN, hide partials
    if (name === 'outcome' && value !== 'WIN') {
      setShowPartials(false)
      setPartials([])
    }
  }

  const addPartial = () => {
    setPartials([...partials, { positionPercent: '', rr: '' }])
    setShowPartials(true)
  }

  const removePartial = (index: number) => {
    setPartials(partials.filter((_, i) => i !== index))
  }

  const updatePartial = (
    index: number,
    field: 'positionPercent' | 'rr',
    value: string
  ) => {
    const updated = [...partials]
    updated[index] = { ...updated[index], [field]: value }
    setPartials(updated)

    // Clear partials error
    if (errors.partials) {
      setErrors((prev) => ({ ...prev, partials: undefined }))
    }
  }

  // Live preview computation
  const previewMetrics = useMemo(() => {
    const risk = parseFloat(formData.riskAmount)
    if (isNaN(risk) || risk <= 0) return null

    const partialsData: TradePartial[] = partials
      .filter((p) => p.positionPercent.trim() && p.rr.trim())
      .map((p) => ({
        sizeFraction: parseFloat(p.positionPercent) / 100,
        rr: parseFloat(p.rr),
      }))

    const totalPercent = partials.reduce(
      (sum, p) => sum + (parseFloat(p.positionPercent) || 0),
      0
    )
    const totalFraction = totalPercent / 100
    const mainRRValue =
      totalFraction < 1.0 && formData.mainRR.trim()
        ? parseFloat(formData.mainRR)
        : totalFraction === 1.0
        ? null
        : formData.mainRR.trim()
        ? parseFloat(formData.mainRR)
        : null

    try {
      const metrics = computeTrade({
        outcome: formData.outcome,
        riskAmount: risk,
        mainRR: mainRRValue,
        partials: partialsData,
      })
      return metrics
    } catch (e) {
      return null
    }
  }, [formData, partials])

  const validate = (): boolean => {
    const newErrors: typeof errors = {}

    // Risk Amount validation
    if (!formData.riskAmount.trim()) {
      newErrors.riskAmount = 'Risk Amount is required'
    } else {
      const risk = parseFloat(formData.riskAmount)
      if (isNaN(risk) || risk <= 0) {
        newErrors.riskAmount = 'Risk Amount must be greater than 0'
      }
    }

    // Outcome validation (always required, handled by select)

    // RR validation (required for WIN, optional for others)
    if (formData.outcome === 'WIN') {
      const hasPartials = partials.length > 0
      const totalPercent = partials.reduce(
        (sum, p) => sum + (parseFloat(p.positionPercent) || 0),
        0
      )
      const totalFraction = totalPercent / 100

      if (!hasPartials || totalFraction < 1.0) {
        // Main RR required if no partials or partials don't total to 100%
        if (!formData.mainRR.trim()) {
          newErrors.mainRR = 'Risk-Reward is required for WIN trades'
        } else {
          const rr = parseFloat(formData.mainRR)
          if (isNaN(rr) || rr <= 0) {
            newErrors.mainRR = 'Risk-Reward must be greater than 0'
          }
        }
      }
    }

    // Partials validation
    if (formData.outcome === 'WIN' && partials.length > 0) {
      let totalPercent = 0
      for (let i = 0; i < partials.length; i++) {
        const p = partials[i]
        const percent = parseFloat(p.positionPercent)
        const rr = parseFloat(p.rr)

        if (!p.positionPercent.trim() || isNaN(percent)) {
          newErrors.partials = `Partial ${i + 1}: Position % is required`
          break
        }
        if (percent <= 0 || percent > 100) {
          newErrors.partials = `Partial ${i + 1}: Position % must be between 1 and 100`
          break
        }
        if (!p.rr.trim() || isNaN(rr) || rr <= 0) {
          newErrors.partials = `Partial ${i + 1}: RR must be greater than 0`
          break
        }

        totalPercent += percent
      }

      if (!newErrors.partials && totalPercent > 100) {
        newErrors.partials = 'Total position % cannot exceed 100%'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isFormValid = (): boolean => {
    const risk = parseFloat(formData.riskAmount)
    if (isNaN(risk) || risk <= 0) return false

    if (formData.outcome === 'WIN') {
      const hasPartials = partials.length > 0
      const totalPercent = partials.reduce(
        (sum, p) => sum + (parseFloat(p.positionPercent) || 0),
        0
      )
      const totalFraction = totalPercent / 100

      if (!hasPartials || totalFraction < 1.0) {
        const rr = parseFloat(formData.mainRR)
        if (isNaN(rr) || rr <= 0) return false
      }

      if (hasPartials) {
        for (const p of partials) {
          const percent = parseFloat(p.positionPercent)
          const rr = parseFloat(p.rr)
          if (
            isNaN(percent) ||
            percent <= 0 ||
            percent > 100 ||
            isNaN(rr) ||
            rr <= 0
          ) {
            return false
          }
        }
        const total = partials.reduce(
          (sum, p) => sum + parseFloat(p.positionPercent),
          0
        )
        if (total > 100) return false
      }
    }

    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    // Prepare partials data (convert percentages to fractions)
    const partialsData: TradePartial[] = partials.map((p) => ({
      sizeFraction: parseFloat(p.positionPercent) / 100,
      rr: parseFloat(p.rr),
    }))

    // Determine mainRR
    const totalFraction = partialsData.reduce(
      (sum, p) => sum + p.sizeFraction,
      0
    )
    const mainRRValue =
      totalFraction < 1.0 && formData.mainRR.trim()
        ? parseFloat(formData.mainRR)
        : totalFraction === 1.0
        ? null
        : parseFloat(formData.mainRR)

    const tradeData = {
      tradeDate: new Date(formData.tradeDate),
      outcome: formData.outcome,
      riskAmount: parseFloat(formData.riskAmount),
      mainRR: mainRRValue,
      partials: partialsData,
      thoughtProcess: formData.thoughtProcess.trim() || null,
    }

    // Debug log
    if (process.env.NODE_ENV === 'development') {
      console.log('AddTradeModal onSubmit', { mode, tradeData })
    }

    // Call onSubmit (this should call addTrade/updateTrade)
    onSubmit(tradeData)

    // Close modal after submit
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const totalPercent = partials.reduce(
    (sum, p) => sum + (parseFloat(p.positionPercent) || 0),
    0
  )
  const totalFraction = totalPercent / 100
  const remainingPercent = Math.max(0, 100 - totalPercent)
  const remainingFraction = remainingPercent / 100
  const showMainRR =
    formData.outcome === 'WIN' && (partials.length === 0 || totalFraction < 1.0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'edit' ? 'Edit Trade' : 'Add Trade'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-6">
            {/* Live Preview */}
            {previewMetrics && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-md p-3 border border-purple-200 dark:border-purple-800 transition-colors">
                <div className="text-xs text-purple-600 dark:text-purple-400 mb-1 font-medium">Computed:</div>
                <div
                  className={`text-lg font-semibold ${
                    previewMetrics.profitLoss > 0
                      ? 'text-green-600 dark:text-green-400'
                      : previewMetrics.profitLoss < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {previewMetrics.profitLoss >= 0 ? '+' : ''}
                  {formatCurrency(previewMetrics.profitLoss)} (
                  {previewMetrics.rMultiple.toFixed(2)}R)
                </div>
              </div>
            )}

            {/* Date */}
            <div>
              <label htmlFor="tradeDate" className="sr-only">
                Trade Date (Required)
              </label>
              <input
                type="date"
                id="tradeDate"
                name="tradeDate"
                value={formData.tradeDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-800 border border-gray-600 dark:border-gray-700 rounded-md text-white dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
                required
                aria-label="Trade Date (Required)"
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Trade date</p>
            </div>

            {/* Risk Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Risk</h3>
              <div>
                <label htmlFor="riskAmount" className="sr-only">
                  Risk Amount (Required)
                </label>
                <input
                  type="number"
                  id="riskAmount"
                  name="riskAmount"
                  value={formData.riskAmount}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
                  placeholder="100.00"
                  required
                  aria-label="Risk Amount (Required)"
                />
                {errors.riskAmount ? (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.riskAmount}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Amount risked on this trade</p>
                )}
              </div>
            </div>

            {/* Outcome Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Outcome</h3>
              <div>
                <label htmlFor="outcome" className="sr-only">
                  Trade Outcome (Required)
                </label>
                <select
                  id="outcome"
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
                  required
                  aria-label="Trade Outcome (Required)"
                >
                  <option value="WIN">WIN</option>
                  <option value="LOSS">LOSS</option>
                  <option value="BE">BE (Breakeven)</option>
                </select>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Trade result</p>
              </div>
            </div>

            {/* Returns Section - only for WIN */}
            {formData.outcome === 'WIN' && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Returns</h3>

                {/* Main RR */}
                {showMainRR && (
                  <div className="mb-4">
                    <label htmlFor="mainRR" className="sr-only">
                      Risk-Reward Ratio (Required)
                    </label>
                    <input
                      type="number"
                      id="mainRR"
                      name="mainRR"
                      value={formData.mainRR}
                      onChange={handleChange}
                      step="0.01"
                      min="0.01"
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
                      placeholder="2.5"
                      required={showMainRR}
                      aria-label={`Risk-Reward Ratio${partials.length > 0 && remainingPercent > 0 ? ` (for ${remainingPercent.toFixed(0)}% remaining)` : ''} (Required)`}
                    />
                    {errors.mainRR ? (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.mainRR}</p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Risk-reward ratio{partials.length > 0 && remainingPercent > 0 ? ` (for ${remainingPercent.toFixed(0)}% remaining)` : ''}
                      </p>
                    )}
                  </div>
                )}

                {/* Partials Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Partials (Optional)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPartials(!showPartials)
                        if (!showPartials) {
                          addPartial()
                        } else {
                          setPartials([])
                        }
                      }}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                    >
                      {showPartials ? 'Hide' : 'Add Partial'}
                    </button>
                  </div>

                  {showPartials && (
                    <div className="space-y-3">
                      {partials.map((partial, index) => (
                        <div
                          key={index}
                          className="bg-gray-700/50 rounded-md p-3 border border-gray-600"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Partial {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePartial(index)}
                              className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label htmlFor={`partial-${index}-percent`} className="sr-only">
                                Position Percentage
                              </label>
                              <input
                                type="number"
                                id={`partial-${index}-percent`}
                                value={partial.positionPercent}
                                onChange={(e) =>
                                  updatePartial(index, 'positionPercent', e.target.value)
                                }
                                step="1"
                                min="1"
                                max="100"
                                className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:focus:ring-purple-400 transition-colors"
                                placeholder="50"
                                aria-label="Position Percentage"
                              />
                              <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Position %</p>
                            </div>
                            <div>
                              <label htmlFor={`partial-${index}-rr`} className="sr-only">
                                Risk-Reward Ratio
                              </label>
                              <input
                                type="number"
                                id={`partial-${index}-rr`}
                                value={partial.rr}
                                onChange={(e) =>
                                  updatePartial(index, 'rr', e.target.value)
                                }
                                step="0.01"
                                min="0.01"
                                className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:focus:ring-purple-400 transition-colors"
                                placeholder="2.0"
                                aria-label="Risk-Reward Ratio"
                              />
                              <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">RR</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {partials.length > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="mb-1">
                            Partials: {totalPercent.toFixed(0)}% used,{' '}
                            {remainingPercent.toFixed(0)}% remaining
                          </div>
                          {remainingPercent > 0 && (
                            <div className="text-gray-400 dark:text-gray-500 italic">
                              Remaining {remainingPercent.toFixed(0)}% will use Main RR
                            </div>
                          )}
                        </div>
                      )}

                      {partials.length > 0 && (
                        <button
                          type="button"
                          onClick={addPartial}
                          className="w-full text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                        >
                          + Add Another Partial
                        </button>
                      )}

                      {errors.partials && (
                        <p className="text-sm text-red-500 dark:text-red-400">{errors.partials}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Thought Process */}
            {settings.thoughts && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Thought Process</h3>
                <div>
                  <label htmlFor="thoughtProcess" className="sr-only">
                    Thought Process
                  </label>
                  <textarea
                    id="thoughtProcess"
                    name="thoughtProcess"
                    value={formData.thoughtProcess}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors resize-y"
                    placeholder="What were you thinking before and during this trade?"
                    aria-label="Thought Process"
                  />
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Optional: Document your reasoning and thought process for this trade
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="px-4 py-2 bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? mode === 'edit'
                  ? 'Updating...'
                  : 'Adding...'
                : mode === 'edit'
                ? 'Save Changes'
                : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
