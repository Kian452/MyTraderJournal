'use client'

import { useState, useEffect, useRef } from 'react'
import type { TradeOutcome, TradePartial } from '@/lib/store'

interface AddTradeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    tradeDate: Date
    outcome: TradeOutcome
    riskAmount: number
    mainRR: number | null
    partials: TradePartial[]
  }) => void
}

/**
 * Modal for adding a new trade
 * Trading-realistic entry with risk amount, outcome, RR, and partials
 */
export default function AddTradeModal({
  isOpen,
  onClose,
  onSubmit,
}: AddTradeModalProps) {
  const [formData, setFormData] = useState({
    tradeDate: new Date().toISOString().split('T')[0],
    outcome: 'WIN' as TradeOutcome,
    riskAmount: '',
    mainRR: '',
  })

  const [partials, setPartials] = useState<Array<{ positionPercent: string; rr: string }>>([])
  const [showPartials, setShowPartials] = useState(false)
  const [errors, setErrors] = useState<{
    riskAmount?: string
    mainRR?: string
    partials?: string
  }>({})

  const modalRef = useRef<HTMLDivElement>(null)

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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        tradeDate: new Date().toISOString().split('T')[0],
        outcome: 'WIN',
        riskAmount: '',
        mainRR: '',
      })
      setPartials([])
      setShowPartials(false)
      setErrors({})
    }
  }, [isOpen])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
        if (percent < 1 || percent > 100) {
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
            percent < 1 ||
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

    onSubmit({
      tradeDate: new Date(formData.tradeDate),
      outcome: formData.outcome,
      riskAmount: parseFloat(formData.riskAmount),
      mainRR: mainRRValue,
      partials: partialsData,
    })

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

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 sticky top-0 bg-gray-800">
          <h2 className="text-xl font-semibold text-white">Add Trade</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-6">
            {/* Date */}
            <div>
              <label
                htmlFor="tradeDate"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Date
              </label>
              <input
                type="date"
                id="tradeDate"
                name="tradeDate"
                value={formData.tradeDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Risk Section */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Risk</h3>
              <div>
                <label
                  htmlFor="riskAmount"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Risk Amount <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  id="riskAmount"
                  name="riskAmount"
                  value={formData.riskAmount}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100.00"
                  required
                />
                {errors.riskAmount && (
                  <p className="mt-1 text-sm text-red-400">{errors.riskAmount}</p>
                )}
              </div>
            </div>

            {/* Outcome Section */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Outcome</h3>
              <div>
                <label
                  htmlFor="outcome"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Outcome <span className="text-red-400">*</span>
                </label>
                <select
                  id="outcome"
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="WIN">WIN</option>
                  <option value="LOSS">LOSS</option>
                  <option value="BE">BE (Breakeven)</option>
                </select>
              </div>
            </div>

            {/* Returns Section - only for WIN */}
            {formData.outcome === 'WIN' && (
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Returns</h3>

                {/* Main RR */}
                {showMainRR && (
                  <div className="mb-4">
                    <label
                      htmlFor="mainRR"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Risk-Reward (RR){' '}
                      {partials.length > 0 && remainingPercent > 0 && (
                        <span className="text-xs text-gray-500">
                          (for {remainingPercent.toFixed(0)}% remaining)
                        </span>
                      )}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      id="mainRR"
                      name="mainRR"
                      value={formData.mainRR}
                      onChange={handleChange}
                      step="0.01"
                      min="0.01"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2.5"
                      required={showMainRR}
                    />
                    {errors.mainRR && (
                      <p className="mt-1 text-sm text-red-400">{errors.mainRR}</p>
                    )}
                  </div>
                )}

                {/* Partials Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Partials (Optional)
                    </label>
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
                      className="text-sm text-blue-400 hover:text-blue-300"
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
                            <span className="text-xs text-gray-400">
                              Partial {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePartial(index)}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">
                                Position %
                              </label>
                              <input
                                type="number"
                                value={partial.positionPercent}
                                onChange={(e) =>
                                  updatePartial(index, 'positionPercent', e.target.value)
                                }
                                step="1"
                                min="1"
                                max="100"
                                className="w-full px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">
                                RR
                              </label>
                              <input
                                type="number"
                                value={partial.rr}
                                onChange={(e) =>
                                  updatePartial(index, 'rr', e.target.value)
                                }
                                step="0.01"
                                min="0.01"
                                className="w-full px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="2.0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {partials.length > 0 && (
                        <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
                          Total: {totalPercent.toFixed(0)}% / 100%
                          {totalPercent < 100 && (
                            <span className="text-gray-400">
                              {' '}
                              (Remaining: {remainingPercent.toFixed(0)}% uses main RR)
                            </span>
                          )}
                        </div>
                      )}

                      {partials.length > 0 && (
                        <button
                          type="button"
                          onClick={addPartial}
                          className="w-full text-sm text-blue-400 hover:text-blue-300 py-2 border border-gray-600 rounded-md hover:border-blue-500 transition-colors"
                        >
                          + Add Another Partial
                        </button>
                      )}

                      {errors.partials && (
                        <p className="text-sm text-red-400">{errors.partials}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
