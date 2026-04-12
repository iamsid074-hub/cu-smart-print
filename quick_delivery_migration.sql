-- Migration to support Fast Delivery Squad features
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_quick BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_quick BOOLEAN DEFAULT false;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_products_is_quick ON products(is_quick);
CREATE INDEX IF NOT EXISTS idx_orders_is_quick ON orders(is_quick);
