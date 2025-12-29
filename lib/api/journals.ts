/**
 * API client for Journals
 * Handles all API calls related to journals
 */

export type Currency = 'USD' | 'EUR'

export interface Journal {
  id: string
  name: string
  startingCapital: number
  currentCapital: number
  currency: Currency
  tradesCount: number
  updatedAt: string | Date
  createdAt: string | Date
}

export interface CreateJournalInput {
  name: string
  startingCapital: number
  currency: Currency
}

/**
 * Fetch all journals for the current user
 */
export async function fetchJournals(): Promise<Journal[]> {
  const response = await fetch('/api/journals', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in')
    }
    const error = await response.json().catch(() => ({ error: 'Failed to fetch journals' }))
    throw new Error(error.error || 'Failed to fetch journals')
  }

  const data = await response.json()
  
  // Transform dates from strings to Date objects
  return data.map((journal: any) => ({
    ...journal,
    updatedAt: new Date(journal.updatedAt),
    createdAt: new Date(journal.createdAt),
  }))
}

/**
 * Create a new journal
 */
export async function createJournal(input: CreateJournalInput): Promise<Journal> {
  const response = await fetch('/api/journals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in')
    }
    const error = await response.json().catch(() => ({ error: 'Failed to create journal' }))
    throw new Error(error.error || 'Failed to create journal')
  }

  const data = await response.json()
  
  // Transform dates from strings to Date objects
  return {
    ...data,
    updatedAt: new Date(data.updatedAt),
    createdAt: new Date(data.createdAt),
  }
}

/**
 * Fetch a single journal by ID
 */
export async function fetchJournal(journalId: string): Promise<Journal> {
  const response = await fetch(`/api/journals/${journalId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in')
    }
    if (response.status === 403) {
      throw new Error('Forbidden: You do not have permission to view this journal')
    }
    if (response.status === 404) {
      throw new Error('Journal not found')
    }
    const error = await response.json().catch(() => ({ error: 'Failed to fetch journal' }))
    throw new Error(error.error || 'Failed to fetch journal')
  }

  const data = await response.json()
  
  // Transform dates from strings to Date objects
  return {
    ...data,
    updatedAt: new Date(data.updatedAt),
    createdAt: new Date(data.createdAt),
  }
}

/**
 * Delete a journal
 */
export async function deleteJournal(journalId: string): Promise<void> {
  const response = await fetch(`/api/journals/${journalId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in')
    }
    if (response.status === 403) {
      throw new Error('Forbidden: You do not have permission to delete this journal')
    }
    if (response.status === 404) {
      throw new Error('Journal not found')
    }
    const error = await response.json().catch(() => ({ error: 'Failed to delete journal' }))
    throw new Error(error.error || 'Failed to delete journal')
  }
}

