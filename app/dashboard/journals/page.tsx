'use client'

import { useState, useEffect } from 'react'
import { fetchJournals, createJournal, deleteJournal, type Journal, type Currency } from '@/lib/api/journals'
import JournalCard from '@/components/dashboard/JournalCard'
import EmptyState from '@/components/dashboard/EmptyState'
import CreateJournalModal from '@/components/dashboard/CreateJournalModal'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'

/**
 * Journals page
 * Displays all journals fetched from the API
 */
export default function JournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteJournalId, setDeleteJournalId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleCreateJournal = async (data: {
    name: string
    startingCapital: number
    currency: Currency
  }) => {
    try {
      setError(null)
      const newJournal = await createJournal(data)
      // Optimistically add to UI
      setJournals((prev) => [newJournal, ...prev])
      setIsCreateModalOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create journal'
      setError(errorMessage)
      console.error('Error creating journal:', err)
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete journal'
      setError(errorMessage)
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          + New Journal
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-md text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-300 hover:text-red-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
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
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateJournal}
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
