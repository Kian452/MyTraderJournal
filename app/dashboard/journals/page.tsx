'use client'

import { useState, useEffect } from 'react'
import { fetchJournals, createJournal, deleteJournal, type Journal, type Currency } from '@/lib/api/journals'
import JournalCard from '@/components/dashboard/JournalCard'
import EmptyState from '@/components/dashboard/EmptyState'
import CreateJournalModal from '@/components/dashboard/CreateJournalModal'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import { useToast } from '@/components/ui/ToastContainer'

/**
 * Journals page
 * Displays all journals fetched from the API
 */
export default function JournalsPage() {
  const { showToast } = useToast()
  const [journals, setJournals] = useState<Journal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteJournalId, setDeleteJournalId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Fetch journals on mount
  useEffect(() => {
    loadJournals()
  }, [])

  const loadJournals = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchJournals()
      setJournals(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load journals'
      setError(errorMessage)
      console.error('Error loading journals:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    loadJournals()
  }

  const handleCreateJournal = async (data: {
    name: string
    startingCapital: number
    currency: Currency
  }) => {
    try {
      setIsCreating(true)
      setError(null)
      const newJournal = await createJournal(data)
      // Optimistically add to UI
      setJournals((prev) => [newJournal, ...prev])
      setIsCreateModalOpen(false)
      showToast('Journal created successfully', 'success')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create journal'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      console.error('Error creating journal:', err)
      // Don't close modal on error so user can retry
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteJournal = (journalId: string) => {
    setDeleteJournalId(journalId)
  }

  const confirmDelete = async () => {
    if (!deleteJournalId) return

    try {
      setIsDeleting(true)
      setError(null)
      await deleteJournal(deleteJournalId)
      // Remove from UI on success
      setJournals((prev) => prev.filter((j) => j.id !== deleteJournalId))
      setDeleteJournalId(null)
      showToast('Journal deleted successfully', 'success')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete journal'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      console.error('Error deleting journal:', err)
      setDeleteJournalId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Journals</h1>
          <p className="text-gray-400">
            Manage your trading journals and track your performance
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={isCreating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Creating...' : '+ New Journal'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-md text-red-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-sm text-red-300 mt-1">
                Please check your connection and try again.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRetry}
                className="px-3 py-1 text-sm bg-red-500/30 hover:bg-red-500/40 rounded transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-200"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading journals...</p>
        </div>
      ) : (
        <>
          {/* Content */}
          {journals.length === 0 ? (
            <EmptyState
              title="You don't have any journals yet"
              description="Create a journal to track trades, refine your strategy, and analyze performance."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {journals.map((journal) => (
                <JournalCard
                  key={journal.id}
                  journal={journal}
                  onDelete={handleDeleteJournal}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Journal Modal */}
      <CreateJournalModal
        isOpen={isCreateModalOpen}
        onClose={() => !isCreating && setIsCreateModalOpen(false)}
        onSubmit={handleCreateJournal}
        isSubmitting={isCreating}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteJournalId !== null}
        onClose={() => !isDeleting && setDeleteJournalId(null)}
        onConfirm={confirmDelete}
        title="Delete journal?"
        message="This will permanently delete the journal and its trades."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        confirmVariant="danger"
      />
    </div>
  )
}
