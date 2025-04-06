// Script to apply migrations to Supabase
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read environment variables from .env file
require('dotenv').config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY // You would need to add this to .env

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Key. Please check your .env file.')
  process.exit(1)
}

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Directory containing migration files
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')

async function applyMigrations() {
  console.log('Starting migration process...')
  
  try {
    // Get list of migration files
    const files = fs.readdirSync(migrationsDir).sort()
    
    if (files.length === 0) {
      console.log('No migration files found.')
      return
    }
    
    console.log(`Found ${files.length} migration files.`)
    
    // Execute each migration file
    for (const file of files) {
      if (!file.endsWith('.sql')) continue
      
      console.log(`Applying migration: ${file}`)
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf8')
      
      // Execute the SQL query
      const { error } = await supabase.rpc('exec_sql', { query: sql })
      
      if (error) {
        console.error(`Error applying migration ${file}:`, error)
        throw error
      }
      
      console.log(`Successfully applied migration: ${file}`)
    }
    
    console.log('Migration process completed successfully!')
    
  } catch (error) {
    console.error('Migration process failed:', error)
    process.exit(1)
  }
}

applyMigrations() 