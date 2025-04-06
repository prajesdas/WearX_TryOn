// This is a utility script to check database connectivity
// Run this with "node src/lib/db-check.js" to verify Supabase connection

const { createClient } = require('@supabase/supabase-js')

// These are hardcoded for testing purposes only - NEVER do this in production code
// Use environment variables instead as in the main application
const supabaseUrl = 'https://ivyyhlzdexzqcquugiat.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2eXlobHpkZXh6cWNxdXVnaWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NjMyNjIsImV4cCI6MjA1OTEzOTI2Mn0.VO_urE9ervGMVSsaTPt1GJ44_Rp99oOV3ht1h4S9yvQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDatabaseConnection() {
  console.log('Checking database connection...')
  
  try {
    // Check products table
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (productsError) {
      console.error('Error accessing products table:', productsError)
    } else {
      console.log('✅ Products table is accessible')
      console.log('Sample product:', products[0] || 'No products found')
    }
    
    // Check profiles table (this will likely fail without auth)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.error('Error accessing profiles table:', profilesError)
      console.log('This is expected if row-level security is enforced and you are not authenticated')
    } else {
      console.log('✅ Profiles table is accessible')
      console.log('Sample profile:', profiles[0] || 'No profiles found')
    }
    
    // Check cart_items table (this will likely fail without auth)
    const { data: cartItems, error: cartItemsError } = await supabase
      .from('cart_items')
      .select('*')
      .limit(1)
    
    if (cartItemsError) {
      console.error('Error accessing cart_items table:', cartItemsError)
      console.log('This is expected if row-level security is enforced and you are not authenticated')
    } else {
      console.log('✅ Cart items table is accessible')
      console.log('Sample cart item:', cartItems[0] || 'No cart items found')
    }
    
    // Check if auth is working
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('Error accessing auth:', authError)
    } else {
      console.log('✅ Auth is accessible')
      console.log('Session:', authData.session ? 'Active' : 'None')
    }
    
  } catch (error) {
    console.error('Unexpected error during database check:', error)
  }
}

checkDatabaseConnection() 