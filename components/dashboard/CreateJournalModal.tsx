'use client'

import { useState, useEffect, useRef } from 'react'

interface CreateJournalModalProps {
  isOpen: boolean
  onClose: () => void
}

type Currency = 'USD' | 'EUR'

interface JournalFormData {
  name: string
  startingCapital: string
  currency: Currency
  confidenceLevel: boolean
  image: boolean
  thoughtProcess: boolean
}

/**
 * Modal for creating a new journal
 * TODO: Connect to API when backend is ready
 */
export default function CreateJournalModal({
  isOpen,
  onClose,
}: CreateJournalModalProps) {
  const [formData, setFormData] = useState<JournalFormData>({
    name: '',
    startingCapital: '',
    currency: 'USD',
    confidenceLevel: false,
    image: false,
    thoughtProcess: false,
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
    }

    if (!formData.startingCapital.trim()) {
      newErrors.startingCapital = 'Starting capital is required'
    } else {
      const capital = parseFloat(formData.startingCapital)
      if (isNaN(capital) || capital <= 0) {
        newErrors.startingCapital = 'Starting capital must be a positive number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    // Log form data (will be replaced with API call)
    console.log('Create Journal:', {
      ...formData,
      startingCapital: parseFloat(formData.startingCapital),
    })

    // Reset form and close modal
    setFormData({
      name: '',
      startingCapital: '',
      currency: 'USD',
      confidenceLevel: false,
      image: false,
      thoughtProcess: false,
    })
    setErrors({})
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

            {/* Optional Attributes */}
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm font-medium text-gray-300 mb-3">
                Optional Attributes
              </p>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="confidenceLevel"
                    checked={formData.confidenceLevel}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-300">
                    Confidence Level
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="image"
                    checked={formData.image}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-300">Image</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="thoughtProcess"
                    checked={formData.thoughtProcess}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-300">
                    Thought Process
                  </span>
                </label>
              </div>
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

