-- Create discounts table for flash sales
CREATE TABLE IF NOT EXISTS discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('PERCENT', 'AMOUNT')),
  value DECIMAL(10,2) NOT NULL CHECK (value > 0),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL CHECK (ends_at > starts_at),
  is_featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create unique index to prevent overlapping active discounts per item
CREATE UNIQUE INDEX IF NOT EXISTS ux_discount_item_active_window
ON discounts(item_id, active)
WHERE active = true;

-- Create index for efficient flash sales queries
CREATE INDEX IF NOT EXISTS idx_discounts_featured_active
ON discounts(is_featured, active, ends_at)
WHERE active = true AND is_featured = true;

-- Create index for time-based queries
CREATE INDEX IF NOT EXISTS idx_discounts_time_window
ON discounts(starts_at, ends_at, active)
WHERE active = true;

-- Add RLS policies
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to active discounts
CREATE POLICY "Public can view active discounts" ON discounts
FOR SELECT USING (active = true);

-- Policy for admin full access
CREATE POLICY "Admins can manage discounts" ON discounts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'jonahrehbeinjones@gmail.com'
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_discounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_discounts_updated_at
  BEFORE UPDATE ON discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_discounts_updated_at();









