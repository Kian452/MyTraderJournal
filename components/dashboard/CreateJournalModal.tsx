'use client'

import { useState, useEffect, useRef } from 'react'
import type { Currency } from '@/lib/types'

interface CreateJournalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; startingCapital: number; currency: Currency }) => void
  isSubmitting?: boolean
}

interface JournalFormData {
  name: string
  startingCapital: string
  currency: Currency
}

/**
 * Modal for creating a new journal
 * TODO: Connect to API when backend is ready
 */
export default function CreateJournalModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateJournalModalProps) {
  const [formData, setFormData] = useState<JournalFormData>({
    name: '',
    startingCapital: '',
    currency: 'USD',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof JournalFormData, string>>>({})
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error for this field
    if (errors[name as keyof JournalFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof JournalFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.startingCapital.trim()) {
      newErrors.startingCapital = 'Starting capital is required'
    } else {
      const capital = parseFloat(formData.startingCapital)
      if (isNaN(capital) || capital <= 0) {
        newErrors.startingCapital = 'Starting capital must be greater than 0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Check if form is valid for button state
  const isFormValid = (): boolean => {
    const capital = parseFloat(formData.startingCapital)
    return (
      formData.name.trim().length >= 2 &&
      formData.startingCapital.trim() !== '' &&
      !isNaN(capital) &&
      capital > 0
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || isSubmitting) {
      return
    }

    // Call parent callback with form data
    onSubmit({
      name: formData.name.trim(),
      startingCapital: parseFloat(formData.startingCapital),
      currency: formData.currency,
    })

    // Don't reset or close here - let parent handle it after async operation
  }

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        startingCapital: '',
        currency: 'USD',
      })
      setErrors({})
    }
  }, [isOpen])

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
          <h2 className="text-xl font-semibold text-white">Create Journal</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Forex Trading Journal"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Starting Capital */}
            <div>
              <label
                htmlFor="startingCapital"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Starting Capital <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                id="startingCapital"
                name="startingCapital"
                value={formData.startingCapital}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10000"
                required
              />
              {errors.startingCapital && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.startingCapital}
                </p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            {/* Template (Coming Soon) */}
            <div>
              <label
                htmlFor="template"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Use Template <span className="text-xs text-gray-500">(Coming Soon)</span>
              </label>
              <select
                id="template"
                name="template"
                disabled
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-md text-gray-500 cursor-not-allowed focus:outline-none"
              >
                <option value="">None (Start Fresh)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Template feature will allow you to copy settings from existing journals
              </p>
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
              disabled={!isFormValid() || isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

