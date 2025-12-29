'use client'

import { useStore } from '@/lib/useStore'
import { createJournal, deleteJournal, Currency } from '@/lib/store'
import JournalCard from '@/components/dashboard/JournalCard'
import EmptyState from '@/components/dashboard/EmptyState'
import CreateJournalModal from '@/components/dashboard/CreateJournalModal'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import { useState } from 'react'

/**
 * Journals page
 * Displays all journals in a grid or empty state
 */
export default function JournalsPage() {
  const { journals } = useStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteJournalId, setDeleteJournalId] = useState<string | null>(null)

  const handleCreateJournal = (data: {
    name: string
    startingCapital: number
    currency: Currency
  }) => {
    createJournal(data)
    setIsCreateModalOpen(false)
  }

  const handleDeleteJournal = (journalId: string) => {
    setDeleteJournalId(journalId)
  }

  const confirmDelete = () => {
    if (!deleteJournalId) return
    deleteJournal(deleteJournalId)
    setDeleteJournalId(null)
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

      {/* Create Journal Modal */}
      <CreateJournalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateJournal}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteJournalId !== null}
        onClose={() => setDeleteJournalId(null)}
        onConfirm={confirmDelete}
        title="Delete journal?"
        message="This will permanently delete the journal and its trades."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
      />
    </div>
  )
}
