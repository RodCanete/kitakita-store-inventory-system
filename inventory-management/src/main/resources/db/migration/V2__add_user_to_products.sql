-- Add user_id column to products table
ALTER TABLE products ADD COLUMN user_id INT NOT NULL;

-- Add foreign key constraint
ALTER TABLE products ADD CONSTRAINT fk_products_user FOREIGN KEY (user_id) REFERENCES users(user_id);

-- Create index for better performance
CREATE INDEX idx_products_user_id ON products(user_id);