-- Add user_id column to suppliers table
ALTER TABLE suppliers ADD COLUMN user_id INT NOT NULL;

-- Add foreign key constraint
ALTER TABLE suppliers ADD CONSTRAINT fk_suppliers_user FOREIGN KEY (user_id) REFERENCES users(user_id);

-- Create index for better performance
CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);