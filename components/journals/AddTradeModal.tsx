'use client'

import { useState, useEffect, useRef } from 'react'

interface AddTradeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    profitLoss: number
    riskReward: number
    tradeDate: Date
  }) => void
}

/**
 * Modal for adding a new trade
 */
export default function AddTradeModal({
  isOpen,
  onClose,
  onSubmit,
}: AddTradeModalProps) {
  const [formData, setFormData] = useState({
    profitLoss: '',
    riskReward: '',
    tradeDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  })

  const [errors, setErrors] = useState<{
    profitLoss?: string
    riskReward?: string
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
      // Trap focus within modal
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
        profitLoss: '',
        riskReward: '',
        tradeDate: new Date().toISOString().split('T')[0],
      })
      setErrors({})
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  const validate = (): boolean => {
    const newErrors: typeof errors = {}

    if (!formData.profitLoss.trim()) {
      newErrors.profitLoss = 'Profit/Loss is required'
    } else {
      const pl = parseFloat(formData.profitLoss)
      if (isNaN(pl)) {
        newErrors.profitLoss = 'Profit/Loss must be a number'
      }
    }

    if (!formData.riskReward.trim()) {
      newErrors.riskReward = 'Risk-Reward is required'
    } else {
      const rr = parseFloat(formData.riskReward)
      if (isNaN(rr) || rr <= 0) {
        newErrors.riskReward = 'Risk-Reward must be greater than 0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isFormValid = (): boolean => {
    const pl = parseFloat(formData.profitLoss)
    const rr = parseFloat(formData.riskReward)
    return (
      !isNaN(pl) &&
      !isNaN(rr) &&
      rr > 0 &&
      formData.profitLoss.trim() !== '' &&
      formData.riskReward.trim() !== ''
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    onSubmit({
      profitLoss: parseFloat(formData.profitLoss),
      riskReward: parseFloat(formData.riskReward),
      tradeDate: new Date(formData.tradeDate),
    })

    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Add Trade</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            {/* Profit/Loss */}
            <div>
              <label
                htmlFor="profitLoss"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Profit/Loss <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                id="profitLoss"
                name="profitLoss"
                value={formData.profitLoss}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="150.50 or -75.25"
                required
              />
              {errors.profitLoss && (
                <p className="mt-1 text-sm text-red-400">{errors.profitLoss}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter positive for profit, negative for loss
              </p>
            </div>

            {/* Risk-Reward */}
            <div>
              <label
                htmlFor="riskReward"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Risk-Reward <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                id="riskReward"
                name="riskReward"
                value={formData.riskReward}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2.5"
                required
              />
              {errors.riskReward && (
                <p className="mt-1 text-sm text-red-400">{errors.riskReward}</p>
              )}
            </div>

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

