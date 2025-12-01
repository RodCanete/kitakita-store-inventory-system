-- Script to check and fix the user_id column issue in products table
-- 
-- This script will:
-- 1. Check if user_id column exists
-- 2. Remove it if it exists (since products are shared, not user-specific)

-- First, check if the column exists (run this to verify):
-- SELECT COLUMN_NAME 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'kitakita_db' 
--   AND TABLE_NAME = 'products' 
--   AND COLUMN_NAME = 'user_id';

-- If the column exists and you want to remove it, run:
-- ALTER TABLE products DROP COLUMN user_id;

-- If you want to keep the column but make it nullable (in case you need it later):
-- ALTER TABLE products MODIFY COLUMN user_id INT NULL;

-- Note: Make sure to backup your database before running any ALTER TABLE commands!

