#!/bin/bash

# Supabase Review System Setup Script
# This script helps you set up the Supabase review system

set -e

echo "🚀 Supabase Review System Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Checking Supabase configuration...${NC}"
echo ""

# Check if Supabase variables are set
SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d '=' -f2)
SUPABASE_ANON_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local | cut -d '=' -f2)
SUPABASE_SERVICE_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY" .env.local | cut -d '=' -f2)

# Check if variables are placeholder values
if [[ "$SUPABASE_ANON_KEY" == *"your_"* ]] || [[ "$SUPABASE_SERVICE_KEY" == *"your_"* ]]; then
    echo -e "${YELLOW}⚠️  Supabase credentials not configured${NC}"
    echo ""
    echo "Please update .env.local with your actual Supabase credentials:"
    echo ""
    echo "1. Go to: https://supabase.com/dashboard/project/deoktruccvehoadxlggl"
    echo "2. Click 'Project Settings' → 'API'"
    echo "3. Copy the following:"
    echo "   - Project URL (already set: $SUPABASE_URL)"
    echo "   - Anon/Public Key → NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - Service Role Key → SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "4. Update .env.local with these values"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Supabase credentials configured${NC}"
echo ""

# Check if @supabase/supabase-js is installed
if ! npm list @supabase/supabase-js > /dev/null 2>&1; then
    echo -e "${YELLOW}📦 Installing @supabase/supabase-js...${NC}"
    npm install @supabase/supabase-js
    echo -e "${GREEN}✅ Package installed${NC}"
    echo ""
else
    echo -e "${GREEN}✅ @supabase/supabase-js already installed${NC}"
    echo ""
fi

# Display migration instructions
echo -e "${BLUE}📊 Database Migration${NC}"
echo ""
echo "Next step: Run the database migration"
echo ""
echo "Option 1: Using Supabase Dashboard (Recommended)"
echo "  1. Go to: https://supabase.com/dashboard/project/deoktruccvehoadxlggl/editor"
echo "  2. Click 'SQL Editor'"
echo "  3. Copy contents of: supabase/migrations/001_create_reviews_table.sql"
echo "  4. Paste and run the SQL"
echo ""
echo "Option 2: Using Supabase CLI"
echo "  1. Install CLI: npm install -g supabase"
echo "  2. Login: supabase login"
echo "  3. Link project: supabase link --project-ref deoktruccvehoadxlggl"
echo "  4. Push migration: supabase db push"
echo ""

# Ask if user wants to open the SQL file
read -p "Would you like to view the migration SQL? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f supabase/migrations/001_create_reviews_table.sql ]; then
        echo ""
        echo -e "${BLUE}=== Migration SQL ===${NC}"
        cat supabase/migrations/001_create_reviews_table.sql
        echo ""
        echo -e "${BLUE}=== End of SQL ===${NC}"
        echo ""
    else
        echo -e "${RED}❌ Migration file not found${NC}"
    fi
fi

# Test connection
echo -e "${BLUE}🔌 Testing Supabase connection...${NC}"
echo ""

# Create a simple test script
cat > /tmp/test-supabase.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('reviews').select('count');
    if (error) {
      if (error.message.includes('relation "public.reviews" does not exist')) {
        console.log('⚠️  Connection successful, but reviews table not found');
        console.log('   Please run the database migration');
      } else {
        console.error('❌ Error:', error.message);
      }
    } else {
      console.log('✅ Connection successful!');
      console.log('✅ Reviews table exists');
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection();
EOF

# Run the test
node /tmp/test-supabase.js
rm /tmp/test-supabase.js

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run the database migration (see instructions above)"
echo "  2. Restart your dev server: npm run dev"
echo "  3. Visit: http://localhost:3000/reviews"
echo "  4. Admin panel: http://localhost:3000/admin/reviews"
echo ""
echo "Documentation:"
echo "  - Full guide: docs/supabase-review-migration-guide.md"
echo "  - Quick start: SUPABASE_MIGRATION_COMPLETE.md"
echo ""

