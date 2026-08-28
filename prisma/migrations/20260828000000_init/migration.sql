-- CreateEnum
CREATE TYPE "TradeOutcome" AS ENUM ('WIN', 'LOSS', 'BE');

-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'IMAGE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "starting_capital" DOUBLE PRECISION NOT NULL,
    "current_capital" DOUBLE PRECISION NOT NULL,
    "trades_count" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL,
    "journal_id" TEXT NOT NULL,
    "trade_date" TIMESTAMP(3) NOT NULL,
    "outcome" "TradeOutcome" NOT NULL,
    "risk_amount" DOUBLE PRECISION NOT NULL,
    "main_rr" DOUBLE PRECISION,
    "profit_loss" DOUBLE PRECISION NOT NULL,
    "r_multiple" DOUBLE PRECISION NOT NULL,
    "is_win" BOOLEAN NOT NULL,
    "thought_process" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_partials" (
    "id" TEXT NOT NULL,
    "trade_id" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "rr" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trade_partials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_attributes" (
    "id" TEXT NOT NULL,
    "journal_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL DEFAULT 'TEXT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_attribute_values" (
    "id" TEXT NOT NULL,
    "trade_id" TEXT NOT NULL,
    "journal_attribute_id" TEXT NOT NULL,
    "value_text" TEXT,
    "value_number" DOUBLE PRECISION,
    "value_boolean" BOOLEAN,
    "value_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trade_attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "journals_user_id_idx" ON "journals"("user_id");

-- CreateIndex
CREATE INDEX "journals_user_id_created_at_idx" ON "journals"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "trades_journal_id_idx" ON "trades"("journal_id");

-- CreateIndex
CREATE INDEX "trades_journal_id_trade_date_idx" ON "trades"("journal_id", "trade_date");

-- CreateIndex
CREATE INDEX "trades_journal_id_outcome_idx" ON "trades"("journal_id", "outcome");

-- CreateIndex
CREATE INDEX "trades_journal_id_is_win_idx" ON "trades"("journal_id", "is_win");

-- CreateIndex
CREATE INDEX "trades_journal_id_created_at_idx" ON "trades"("journal_id", "created_at");

-- CreateIndex
CREATE INDEX "trades_journal_id_trade_date_profit_loss_idx" ON "trades"("journal_id", "trade_date", "profit_loss");

-- CreateIndex
CREATE INDEX "trade_partials_trade_id_idx" ON "trade_partials"("trade_id");

-- CreateIndex
CREATE INDEX "journal_attributes_journal_id_idx" ON "journal_attributes"("journal_id");

-- CreateIndex
CREATE UNIQUE INDEX "journal_attributes_journal_id_name_key" ON "journal_attributes"("journal_id", "name");

-- CreateIndex
CREATE INDEX "trade_attribute_values_trade_id_idx" ON "trade_attribute_values"("trade_id");

-- CreateIndex
CREATE INDEX "trade_attribute_values_journal_attribute_id_idx" ON "trade_attribute_values"("journal_attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "trade_attribute_values_trade_id_journal_attribute_id_key" ON "trade_attribute_values"("trade_id", "journal_attribute_id");

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "journals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_partials" ADD CONSTRAINT "trade_partials_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_attributes" ADD CONSTRAINT "journal_attributes_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "journals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_attribute_values" ADD CONSTRAINT "trade_attribute_values_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_attribute_values" ADD CONSTRAINT "trade_attribute_values_journal_attribute_id_fkey" FOREIGN KEY ("journal_attribute_id") REFERENCES "journal_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

