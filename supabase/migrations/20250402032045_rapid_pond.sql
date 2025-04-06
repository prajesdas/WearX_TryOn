/*
  # Initial Schema Setup for Virtual Outfit Store

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `created_at` (timestamp)
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `image_url` (text)
      - `created_at` (timestamp)
    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `product_id` (uuid, references products)
      - `quantity` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage their own cart items"
  ON cart_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample products if table is empty
INSERT INTO products (name, description, price, image_url)
SELECT 'Classic White T-Shirt', 'Essential cotton t-shirt for everyday wear', 29.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO products (name, description, price, image_url)
SELECT 'Blue Denim Jeans', 'Comfortable slim-fit jeans', 79.99, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Blue Denim Jeans');

INSERT INTO products (name, description, price, image_url)
SELECT 'Black Leather Jacket', 'Timeless leather jacket for any occasion', 199.99, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Black Leather Jacket');

INSERT INTO products (name, description, price, image_url)
SELECT 'Striped Summer Dress', 'Light and breezy summer dress', 89.99, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Striped Summer Dress');