# Prisma Setup Guide

## Database Schema

The Prisma schema defines the following models:

### Core Models

1. **User** - User accounts with authentication
2. **Journal** - Trading journals belonging to users
3. **Trade** - Individual trades within journals
4. **JournalAttribute** - Custom attribute definitions per journal
5. **TradeAttributeValue** - Values for custom attributes on trades

### Key Features

- **Relations**: Properly configured foreign keys with cascading deletes
- **Indexes**: Optimized for analytics queries (equity curve, win rate, calendar P&L)
- **Flexible Attributes**: Support for custom attributes per journal (TEXT, NUMBER, BOOLEAN, IMAGE)
- **Capital Tracking**: Real-time capital updates in journals

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `@prisma/client` - Prisma Client for database queries
- `prisma` - Prisma CLI (dev dependency)

### 2. Configure Database

Ensure your `.env` file has the `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mytradingjournal
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

This generates the TypeScript types and Prisma Client based on your schema.

### 4. Run Migrations

```bash
npm run db:migrate
```

This will:
- Create a new migration
- Apply it to your database
- Regenerate Prisma Client

### 5. (Optional) Open Prisma Studio

```bash
npm run db:studio
```

Opens a visual database browser at http://localhost:5555

## Usage in Code

### Import Prisma Client

```typescript
import { prisma } from '@/lib/prisma'
```

### Example Queries

```typescript
// Get user with journals
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { journals: true }
})

// Get journal with trades
const journal = await prisma.journal.findUnique({
  where: { id: journalId },
  include: {
    trades: {
      orderBy: { tradeDate: 'desc' }
    },
    attributes: true
  }
})

// Create a trade
const trade = await prisma.trade.create({
  data: {
    journalId: journalId,
    profitLoss: 150.50,
    riskReward: 2.5,
    isWin: true,
    tradeDate: new Date()
  }
})

// Update journal capital after trade
await prisma.journal.update({
  where: { id: journalId },
  data: {
    currentCapital: {
      increment: trade.profitLoss
    }
  }
})
```

## Schema Design Notes

### Analytics Optimization

The schema includes indexes optimized for:
- **Equity Curve**: `[journalId, tradeDate, profitLoss]` - Fast cumulative P&L queries
- **Win Rate**: `[journalId, isWin]` - Fast win/loss filtering
- **Calendar P&L**: `[journalId, tradeDate]` - Fast date-based grouping
- **Custom Attributes**: Indexes on `tradeId` and `journalAttributeId` for joins

### Cascading Deletes

- Deleting a User → deletes all Journals → deletes all Trades
- Deleting a Journal → deletes all Trades and JournalAttributes
- Deleting a Trade → deletes all TradeAttributeValues

### Custom Attributes

Journals can define custom attributes (e.g., "Strategy", "Market Condition").
Trades can store values for these attributes, enabling flexible data collection
while maintaining type safety and query performance.

## Next Steps

After running migrations:
1. Update authentication to use Prisma User model
2. Create API routes for journals and trades
3. Implement analytics queries using the optimized indexes
4. Add validation and business logic

