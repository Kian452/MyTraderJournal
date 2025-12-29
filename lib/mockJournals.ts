/**
 * Mock data for journals
 * TODO: Replace with Prisma queries when backend is ready
 */

export type Currency = 'USD' | 'EUR'

export interface Journal {
  id: string
  name: string
  startingCapital: number
  currentCapital: number
  currency: Currency
  tradesCount: number
  lastUpdated: Date
  createdAt: Date
}

// Mock journals data
// Set to empty array [] to test empty state, or populate with sample data
// Example: export const mockJournals: Journal[] = [] // for empty state
export const mockJournals: Journal[] = [
  {
    id: '1',
    name: 'Forex Trading Journal',
    startingCapital: 10000,
    currentCapital: 12500,
    currency: 'USD',
    tradesCount: 45,
    lastUpdated: new Date('2024-01-15'),
    createdAt: new Date('2023-12-01'),
  },
  {
    id: '2',
    name: 'Stock Trading Journal',
    startingCapital: 5000,
    currentCapital: 4800,
    currency: 'USD',
    tradesCount: 23,
    lastUpdated: new Date('2024-01-14'),
    createdAt: new Date('2023-11-15'),
  },
  {
    id: '3',
    name: 'Crypto Journal',
    startingCapital: 2000,
    currentCapital: 2100,
    currency: 'USD',
    tradesCount: 12,
    lastUpdated: new Date('2024-01-13'),
    createdAt: new Date('2024-01-01'),
  },
]

// Helper to get journals (simulates API call)
export function getMockJournals(): Journal[] {
  return mockJournals
}

// Helper to get a single journal
export function getMockJournal(id: string): Journal | undefined {
  return mockJournals.find((j) => j.id === id)
}

