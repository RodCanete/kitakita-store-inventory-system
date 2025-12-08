-- Fix purchase status enum values to match Java enum
UPDATE purchases SET status = 'COMPLETED' WHERE status = 'completed';
UPDATE purchases SET status = 'CANCELLED' WHERE status = 'cancelled';
UPDATE purchases SET status = 'PENDING' WHERE status = 'pending';

-- Alter table to ensure enum values match
ALTER TABLE purchases MODIFY COLUMN status ENUM('COMPLETED', 'CANCELLED', 'PENDING') DEFAULT 'COMPLETED';