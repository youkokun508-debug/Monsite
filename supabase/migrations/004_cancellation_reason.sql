-- Add cancellation_reason column to reservations table
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
