/*
  # Add RLS policies for cart_items table

  1. Security Changes
    - Enable RLS on cart_items table if not already enabled
    - Add policies to allow users to:
      - Insert their own cart items
      - Read their own cart items
      - Update their own cart items
      - Delete their own cart items
    - Each policy is created only if it doesn't already exist
*/

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'cart_items' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Policy for inserting cart items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cart_items' 
    AND policyname = 'Users can insert their own cart items'
  ) THEN
    CREATE POLICY "Users can insert their own cart items"
      ON cart_items
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy for reading cart items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cart_items' 
    AND policyname = 'Users can view their own cart items'
  ) THEN
    CREATE POLICY "Users can view their own cart items"
      ON cart_items
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy for updating cart items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cart_items' 
    AND policyname = 'Users can update their own cart items'
  ) THEN
    CREATE POLICY "Users can update their own cart items"
      ON cart_items
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy for deleting cart items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cart_items' 
    AND policyname = 'Users can delete their own cart items'
  ) THEN
    CREATE POLICY "Users can delete their own cart items"
      ON cart_items
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;